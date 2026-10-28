/* Körnige Armillarskulptur: ursprüngliche Gestalt, gemeinsamer Antrieb.
   Die Münze verlässt ihre Fassung entlang einer einzigen, stetigen Führung. */
(() => {
  'use strict';
  const canvas=document.querySelector('#sculpture'),wrap=canvas.parentElement,main=document.querySelector('main');
  const guide=document.querySelector('#coin-guide'),path=document.querySelector('#journey-path');
  const anchor=document.querySelector('#coin-anchor'),rotor=document.querySelector('#coin-rotor'),dock=document.querySelector('#coin-dock');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'low-power'});
  const I=()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
  function mul(a,b){const o=Array(16).fill(0);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o;}
  const chain=(...ms)=>ms.reduce(mul,I());
  const T=(x,y,z)=>{const m=I();m[12]=x;m[13]=y;m[14]=z;return m;};
  const S=s=>[s,0,0,0,0,s,0,0,0,0,s,0,0,0,0,1];
  const RX=a=>{const c=Math.cos(a),s=Math.sin(a);return[1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1];};
  const RY=a=>{const c=Math.cos(a),s=Math.sin(a);return[c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1];};
  const RZ=a=>{const c=Math.cos(a),s=Math.sin(a);return[c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1];};
  const transform=(m,p)=>[0,1,2].map(r=>m[r]*p[0]+m[4+r]*p[1]+m[8+r]*p[2]+m[12+r]);
  const normalize=n=>{const l=Math.hypot(...n)||1;return n.map(x=>x/l);};
  const root=chain(RX(.16),RY(-.17));
  const center=T(0,.45,0),twoPi=Math.PI*2;
  const turnAngle=seconds=>.34*Math.sin(seconds*twoPi/48);
  const blue=[.08,.29,.81];
  const hoopA=chain(RZ(.66),RY(1.1),RX(Math.PI/2));
  const hoopB=chain(RZ(-.64),RY(-1.08),RX(Math.PI/2));
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  // A third great circle completes the rigid spherical frame. Its normal is
  // perpendicular to the two existing hoops, so no side view becomes flat.
  const thirdNormal=normalize(cross(transform(hoopA,[0,1,0]),transform(hoopB,[0,1,0])));
  const thirdX=normalize(cross([0,0,1],thirdNormal)),thirdZ=cross(thirdX,thirdNormal);
  const hoopC=[...thirdX,0,...thirdNormal,0,...thirdZ,0,0,0,0,1];
  let projection=I(),width=1,height=1,viewHeight=9.2,frame=0,last=0,time=0,draws=0,progress=0,targetProgress=0,arrived=false,paused=window.MintPreview.paused;
  let startAt=50,endAt=800,totalLength=1,coinPos={x:0,y:0},coinSize=100,program,loc,meshes;

  let sideJourney=false,joinLength=0,joinY=0,railX=40,mainTop=0,railEnd=0,arrivalY=0,joinAt=0;
  const desktop=matchMedia('(min-width: 1024px)');
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

  function geometry(vertices){const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);return{buffer,count:vertices.length/6};}
  function lathe(profile,steps=112){
    const data=[];
    const point=(i,j)=>{const [r,y]=profile[j],a=i/steps*Math.PI*2;return[r*Math.cos(a),y,r*Math.sin(a)];};
    for(let j=0;j<profile.length-1;j++)for(let i=0;i<steps;i++){
      const dy=profile[j+1][1]-profile[j][1],dr=profile[j+1][0]-profile[j][0];
      const vertex=(u,v)=>{const a=u/steps*Math.PI*2,n=normalize([dy*Math.cos(a),-dr,dy*Math.sin(a)]);data.push(...point(u,v),...n);};
      vertex(i,j);vertex(i+1,j);vertex(i+1,j+1);vertex(i,j);vertex(i+1,j+1);vertex(i,j+1);
    }return geometry(data);
  }
  function band(radius,width,depth){const r=radius,w=width/2,d=depth/2,b=Math.min(width,depth)*.18;
    // Geschlossenes, abgefastes Profil; Ring liegt zunächst in der XZ-Ebene.
    return lathe([[r-w,-d+b],[r-w+b,-d],[r+w-b,-d],[r+w,-d+b],[r+w,d-b],[r+w-b,d],[r-w+b,d],[r-w,d-b],[r-w,-d+b]],144);
  }
  function sphere(){const data=[],u=40,v=24;const pt=(i,j)=>{const a=i/u*Math.PI*2,b=j/v*Math.PI;return[Math.cos(a)*Math.sin(b),Math.cos(b),Math.sin(a)*Math.sin(b)];};
    for(let j=0;j<v;j++)for(let i=0;i<u;i++)for(const [a,b]of[[i,j],[i+1,j],[i+1,j+1],[i,j],[i+1,j+1],[i,j+1]]){const p=pt(a,b);data.push(...p,...p);}return geometry(data);
  }
  function setup(){
    const vert=`attribute vec3 position;attribute vec3 normal;uniform mat4 projection;uniform mat4 model;varying vec3 vNormal;varying vec3 vLocal;varying vec3 vLocalNormal;varying vec3 vWorld;void main(){vec4 p=model*vec4(position,1.);vNormal=normalize(mat3(model)*normal);vLocal=position;vLocalNormal=normal;vWorld=p.xyz;gl_Position=projection*p;}`;
    // Das Korn ist eine feste Materialtextur mit Mipmaps. Es dreht sich mit
    // der Oberfläche und wird nicht für jedes Animationsbild neu gewürfelt.
    const frag=`precision highp float;varying vec3 vNormal;varying vec3 vLocal;varying vec3 vLocalNormal;varying vec3 vWorld;uniform vec3 pigment;uniform sampler2D grainMap;void main(){vec3 n=normalize(vNormal);vec3 light=normalize(vec3(-.45,.8,1.));float diffuse=max(dot(n,light),0.);float side=max(dot(n,normalize(vec3(1.,.4,-.2))),0.);float rim=pow(1.-abs(n.z),3.);float spec=pow(max(dot(reflect(-light,n),vec3(0.,0.,1.)),0.),28.);vec3 weights=pow(abs(normalize(vLocalNormal)),vec3(4.));weights/=max(dot(weights,vec3(1.)),.001);float grain=dot(vec3(texture2D(grainMap,vLocal.yz*.34).r,texture2D(grainMap,vLocal.xz*.34).r,texture2D(grainMap,vLocal.xy*.34).r),weights)-.5;vec3 c=pigment*(.27+.94*diffuse)+vec3(.06,.12,.23)*side+vec3(.08,.14,.22)*rim+vec3(.34,.43,.52)*spec;c*=clamp((vWorld.y+4.3)*.075,.72,1.);c+=grain*(.18+.22*diffuse);gl_FragColor=vec4(c,1.);}`;
    function compile(type,code){const s=gl.createShader(type);gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
    program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vert));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,frag));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
    loc={position:gl.getAttribLocation(program,'position'),normal:gl.getAttribLocation(program,'normal'),model:gl.getUniformLocation(program,'model'),projection:gl.getUniformLocation(program,'projection'),pigment:gl.getUniformLocation(program,'pigment')};
    gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.clearColor(0,0,0,0);
    const noise=new Uint8Array(256*256*4);let seed=0x5b1a7;
    for(let i=0;i<noise.length;i+=4){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;const value=(seed>>>0)&255;noise[i]=noise[i+1]=noise[i+2]=value;noise[i+3]=255;}
    const grainMap=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,grainMap);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,256,256,0,gl.RGBA,gl.UNSIGNED_BYTE,noise);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.generateMipmap(gl.TEXTURE_2D);gl.uniform1i(gl.getUniformLocation(program,'grainMap'),0);
    meshes={outer:band(2.65,.27,.24),crossHoop:band(2.65,.18,.18),middle:band(2.12,.045,.05),inner:band(1.43,.035,.035),sphere:sphere(),axis:lathe([[0,-2.9],[.047,-2.9],[.047,2.9],[0,2.9]]),post:lathe([[0,-3.65],[.066,-3.65],[.066,-1.5],[0,-1.5]]),plinth:lathe([[.26,-3.7],[1.16,-3.7],[1.2,-3.65],[.69,-2.58],[.61,-2.55],[.26,-2.55],[.26,-3.7]]),base:lathe([[.26,-4.02],[1.68,-4.02],[1.7,-3.9],[1.6,-3.83],[.26,-3.83],[.26,-4.02]]),collar:band(.8,.14,.13),floor:lathe([[0,-4.17],[1.94,-4.17],[1.94,-4.08],[0,-4.08]])};
  }
  let available=!!gl;
  if(gl){try{setup();}catch(e){available=false;console.warn('Grafische Ersatzansicht aktiv:',e.message);}}
  wrap.classList.toggle('webgl-unavailable',!available);
  function paint(mesh,m,color=blue){gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);gl.enableVertexAttribArray(loc.position);gl.enableVertexAttribArray(loc.normal);gl.vertexAttribPointer(loc.position,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(loc.normal,3,gl.FLOAT,false,24,12);gl.uniformMatrix4fv(loc.model,false,chain(root,m));gl.uniform3fv(loc.pigment,color);gl.drawArrays(gl.TRIANGLES,0,mesh.count);}
  function drawScene(){
    if(!available)return;
    gl.viewport(0,0,canvas.width,canvas.height);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniformMatrix4fv(loc.projection,false,projection);
    paint(meshes.floor,I(),[.79,.78,.72]);paint(meshes.base,I());paint(meshes.plinth,I());
    paint(meshes.post,T(-.8,0,0));paint(meshes.post,T(.8,0,0));paint(meshes.collar,T(0,-2.05,0));
    paint(meshes.axis,T(0,-.02,-.5));paint(meshes.sphere,chain(T(0,3.18,-.5),S(.17)));
    // Drei feste Ringebenen bilden einen räumlichen, runden Rahmen. Der gesamte
    // Kopf schwenkt als starres Ganzes. Die schmale Kantenansicht wird vermieden.
    const assembly=chain(center,RY(turnAngle(time)));
    paint(meshes.outer,chain(assembly,hoopA));
    paint(meshes.outer,chain(assembly,hoopB),[.075,.32,.88]);
    paint(meshes.crossHoop,chain(assembly,hoopC),[.09,.33,.86]);
    // Feste Bahnebenen im selben Aufbau: die Körper laufen tatsächlich auf den
    // Kreisbahnen und verdecken sich durch den gemeinsamen Tiefenpuffer korrekt.
    const orbit=chain(assembly,RZ(-.26),RX(.36));
    paint(meshes.middle,orbit,[.12,.34,.8]);
    for(const [offset,size] of [[0,.31],[Math.PI,.15],[1.8,.09]]){
      const a=time*twoPi/22+offset+.5,p=transform(orbit,[2.12*Math.cos(a),0,2.12*Math.sin(a)]);
      paint(meshes.sphere,chain(T(...p),RY(a),S(size)),offset===0?[.12,.38,.87]:[.18,.43,.93]);
    }
    const inner=chain(assembly,RZ(.25),RX(1.18));paint(meshes.inner,inner,[.13,.37,.85]);
    const a=-time*twoPi/16+2.7,p=transform(inner,[1.43*Math.cos(a),0,1.43*Math.sin(a)]);
    paint(meshes.sphere,chain(T(...p),RY(a),S(.12)),[.32,.55,.9]);
    draws++;
  }
  function screen(point){const p=transform(root,point);return{x:width/2+p[0]*height/viewHeight,y:height/2-p[1]*height/viewHeight};}
  function measure(){
    const wasSide=sideJourney,oldJoin=joinLength,oldDistance=progress*totalLength,oldTotal=totalLength;
    sideJourney=desktop.matches;
    document.body.classList.toggle('desktop-journey',sideJourney);
    const r=canvas.getBoundingClientRect(),base=main.getBoundingClientRect(),d=dock.getBoundingClientRect();width=r.width;height=r.height;
    // The tilted floor extends below -4.4. Leave real space for its front edge.
    viewHeight=innerWidth<761?Math.max(9.2,5.6*height/(innerWidth-28)):innerWidth<=1150?Math.max(9.2,5.6*height/(innerWidth*.46)):9.2;
    mainTop=base.top+scrollY;
    const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    projection=[2/(viewHeight*width/height),0,0,0,0,2/viewHeight,0,0,0,0,-.12,0,0,0,0,1];
    const c=screen([.52,.94,3]),exit=screen([2.4,-2.8,1]);
    const start={x:r.left-base.left+c.x,y:r.top-base.top+c.y};
    const end={x:d.left-base.left+d.width/2,y:d.top-base.top+d.height-44};
    const span=end.y-start.y;
    const gate={x:Math.min(r.left-base.left+exit.x,base.width-38),y:Math.min(r.top-base.top+exit.y,end.y-span*.22)};
    // Zwei Bézierbögen teilen dieselbe senkrechte Tangente. Die Führung
    // verlässt die Fassung, läuft am Sockel vorbei und endet im Startplatz.
    let data=`M${start.x},${start.y} C${start.x},${start.y+span*.28} ${gate.x},${gate.y-span*.14} ${gate.x},${gate.y} C${gate.x},${gate.y+span*.14} ${end.x},${end.y-span*.17} ${end.x},${end.y}`;
    if(sideJourney){
      const hero=document.querySelector('.hero').getBoundingClientRect(),footer=document.querySelector('footer').getBoundingClientRect();
      railX=Math.max(40,(base.width-1360)/2-20);
      const bendY=hero.bottom-base.top-38;
      joinY=bendY+66;
      const exitX=Math.min(base.width-35,r.left-base.left+width/2+2.2*height/viewHeight);
      // Cross only the clear strip beneath the hero, then follow the gutter.
      data=`M${start.x},${start.y} C${exitX},${start.y+40} ${exitX},${bendY-55} ${exitX},${bendY-28} Q${exitX},${bendY} ${exitX-45},${bendY} L${railX+66},${bendY} Q${railX},${bendY} ${railX},${joinY}`;
      path.setAttribute('d',data);joinLength=path.getTotalLength();
      railEnd=Math.max(joinY+100,footer.bottom-base.top-30);
      data+=` L${railX},${railEnd}`;
      const pinY=clamp(innerHeight*.46,180,innerHeight-100);
      startAt=0;joinAt=Math.max(120,joinY+mainTop-pinY);endAt=railEnd+mainTop-pinY;
      arrivalY=document.querySelector('#experiment').getBoundingClientRect().top-base.top+150;
      guide.style.height=(railEnd+29)+'px';
    }else{
      joinLength=0;joinY=0;
      guide.style.height=(end.y+100)+'px';
      startAt=Math.max(40,start.y+mainTop-innerHeight*.62);endAt=Math.max(startAt+200,end.y+mainTop-innerHeight*.46);
    }
    path.setAttribute('d',data);guide.querySelectorAll('path:not(#journey-path)').forEach(p=>p.setAttribute('d',data));
    totalLength=path.getTotalLength();
    if(wasSide!==sideJourney)progress=desiredProgress();
    else if(sideJourney&&oldTotal>1){
      // Keep the coin in the viewport when search/filter changes page length.
      progress=oldDistance>=oldJoin?desiredProgress():clamp(oldDistance/Math.max(oldJoin,1),0,1)*joinLength/totalLength;
    }
    const unit=height/viewHeight,cx=width/2,cy=height/2-.45*unit;
    const shadow=wrap.querySelector('.sculpture-shadow');
    Object.assign(shadow.style,{left:(width/2-2*unit)+'px',top:(height/2+4.04*unit)+'px',width:4*unit+'px',height:.30*unit+'px',bottom:'auto',right:'auto'});
    const fallback=wrap.querySelector('.sculpture-fallback');
    fallback.setAttribute('viewBox',`0 0 ${width} ${height}`);
    fallback.innerHTML=`<defs><filter id="material-grain"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="2" seed="17"/><feColorMatrix type="saturate" values="0"/><feComposite operator="in" in2="SourceGraphic"/><feBlend mode="soft-light" in="SourceGraphic"/></filter></defs><g filter="url(#material-grain)"><g fill="none" stroke="#2457d7" stroke-width="${.27*unit}"><ellipse cx="${cx}" cy="${cy}" rx="${2.65*unit}" ry="${1.1*unit}" transform="rotate(53 ${cx} ${cy})"/><ellipse cx="${cx}" cy="${cy}" rx="${2.65*unit}" ry="${1.1*unit}" transform="rotate(-53 ${cx} ${cy})"/></g><ellipse cx="${cx}" cy="${cy}" rx="${2.65*unit}" ry="${1.7*unit}" fill="none" stroke="#2457d7" stroke-width="${.18*unit}"/><g fill="none" stroke="#2457d7" stroke-width="${.045*unit}"><ellipse cx="${cx}" cy="${cy}" rx="${2.12*unit}" ry="${.8*unit}"/><ellipse cx="${cx}" cy="${cy}" rx="${1.43*unit}" ry="${1.4*unit}"/><path d="M${cx} ${cy-3*unit}V${cy+2.8*unit}"/></g><path d="M${cx-.62*unit} ${height/2+2.55*unit}h${1.24*unit}l${.58*unit} ${1.1*unit}h${-2.4*unit}Z" fill="#2457d7"/><ellipse cx="${cx}" cy="${height/2+3.94*unit}" rx="${1.7*unit}" ry="${.22*unit}" fill="#2457d7"/><circle cx="${cx+1.8*unit}" cy="${cy+.42*unit}" r="${.30*unit}" fill="#2457d7"/></g>`;

    requestDraw();
  }
  function desiredProgress(){
    if(reduced.matches)return 0;
    if(!sideJourney)return clamp((scrollY-startAt)/(endAt-startAt),0,1);
    let distance;
    if(scrollY<joinAt){
      const t=clamp(scrollY/joinAt,0,1),slope=Math.min(1,joinAt/joinLength);
      // Ease out of the holder, then join the rail at one pixel per scroll pixel.
      distance=joinLength*((slope-2)*t*t*t+(3-slope)*t*t);
    }else{
      const pinY=clamp(innerHeight*.46,180,innerHeight-100);
      distance=joinLength+clamp(scrollY+pinY-mainTop-joinY,0,railEnd-joinY);
    }
    return clamp(distance/totalLength,0,1);
  }
  function coin(delta){
    targetProgress=desiredProgress();
    if(reduced.matches)progress=0;
    else if(!paused){progress+=(targetProgress-progress)*(1-Math.exp(-delta*14));if(Math.abs(targetProgress-progress)*totalLength<.1)progress=targetProgress;}
    const distance=progress*totalLength,p=path.getPointAtLength(distance);coinPos={x:p.x,y:p.y};
    const transfer=sideJourney?clamp(distance/Math.max(joinLength,1),0,1):progress;
    const initialSize=1.07*height/viewHeight;coinSize=initialSize*(1-transfer)+(sideJourney?48:innerWidth<761?49:65)*transfer;
    anchor.style.visibility='visible';anchor.style.transform=`translate3d(${p.x-60}px,${p.y-60}px,0) scale(${coinSize/120})`;
    const eased=transfer*transfer*(3-2*transfer),sideDistance=Math.max(0,distance-joinLength);
    rotor.style.transform=`rotateY(${Math.sin(transfer*Math.PI)*22+(sideJourney?Math.sin(sideDistance/220)*12:0)}deg) rotateZ(${eased*360+(sideJourney?sideDistance*.4:0)}deg)`;
    const atExperiment=sideJourney?p.y>=arrivalY:progress>=.999;
    dock.classList.toggle('arrived',!sideJourney&&atExperiment);
    if(atExperiment&&!arrived&&!paused&&!reduced.matches){arrived=true;window.dispatchEvent(new CustomEvent('mint:arrival'));}
  }
  function tick(now){frame=0;const delta=last?Math.min((now-last)/1000,.05):1/60;last=now;
    if(!paused&&!reduced.matches)time+=delta;
    const rect=wrap.getBoundingClientRect();if(rect.bottom>0&&rect.top<innerHeight)drawScene();
    coin(delta);
    const unsettled=Math.abs(targetProgress-progress)*totalLength>.1;
    if(!paused&&!reduced.matches&&!document.hidden&&(rect.bottom>0&&rect.top<innerHeight||unsettled))frame=requestAnimationFrame(tick);
  }
  function requestDraw(){if(!frame&&!document.hidden)frame=requestAnimationFrame(tick);}
  let measureFrame=0;
  function scheduleMeasure(){if(!measureFrame)measureFrame=requestAnimationFrame(()=>{measureFrame=0;measure();});}
  const layoutObserver=new ResizeObserver(scheduleMeasure);layoutObserver.observe(wrap);layoutObserver.observe(main);layoutObserver.observe(document.querySelector('footer'));
  addEventListener('resize',scheduleMeasure);addEventListener('scroll',requestDraw,{passive:true});
  addEventListener('mint:motion',e=>{paused=e.detail.paused;last=0;requestDraw();});
  document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){cancelAnimationFrame(frame);frame=0;}else requestDraw();});
  addEventListener('pagehide',()=>{cancelAnimationFrame(frame);frame=0;last=0;});addEventListener('pageshow',requestDraw);
  reduced.addEventListener('change',()=>{progress=0;measure();});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();available=false;wrap.classList.add('webgl-unavailable');requestDraw();});
  canvas.addEventListener('webglcontextrestored',()=>{try{setup();available=true;wrap.classList.remove('webgl-unavailable');measure();}catch{available=false;}});
  window.MintJourney={inspect:()=>({available,time,draws,assemblyAngle:turnAngle(time),orbitAngle:time*twoPi/22,progress,targetProgress,arrived,coinPos,coinSize,startAt,endAt,totalLength,paused,sideJourney,joinAt,joinY,joinLength,railX,railEnd,mainTop,viewHeight}),refresh:measure};
  measure();
})();
