define(["./AttributeCompression-f7a901f9","./Transforms-f15de320","./Matrix2-c6c16658","./when-4bbc8319","./TerrainEncoding-6d07f5d8","./IndexDatatype-ddbc25a7","./RuntimeError-5b082e8f","./ComponentDatatype-3d0a0aac","./OrientedBoundingBox-f3d80bd4","./createTaskProcessorWorker","./combine-e9466e32","./WebGLConstants-508b9636","./EllipsoidTangentPlane-41514392","./AxisAlignedBoundingBox-a572809f","./IntersectionTests-a4e54d9a","./Plane-26e67b94"],(function(e,t,n,i,s,r,h,o,u,d,p,l,a,f,c,g){"use strict";const m_clipTriangleAtAxisAlignedThreshold=function(e,t,n,s,r,h){let o,u,d;i.defined(h)?h.length=0:h=[],t?(o=n<e,u=s<e,d=r<e):(o=n>e,u=s>e,d=r>e);const p=o+u+d;let l,a,f,c,g,m;return 1===p?o?(l=(e-n)/(s-n),a=(e-n)/(r-n),h.push(1),h.push(2),1!==a&&(h.push(-1),h.push(0),h.push(2),h.push(a)),1!==l&&(h.push(-1),h.push(0),h.push(1),h.push(l))):u?(f=(e-s)/(r-s),c=(e-s)/(n-s),h.push(2),h.push(0),1!==c&&(h.push(-1),h.push(1),h.push(0),h.push(c)),1!==f&&(h.push(-1),h.push(1),h.push(2),h.push(f))):d&&(g=(e-r)/(n-r),m=(e-r)/(s-r),h.push(0),h.push(1),1!==m&&(h.push(-1),h.push(2),h.push(1),h.push(m)),1!==g&&(h.push(-1),h.push(2),h.push(0),h.push(g))):2===p?o||n===e?u||s===e?d||r===e||(a=(e-n)/(r-n),f=(e-s)/(r-s),h.push(2),h.push(-1),h.push(0),h.push(2),h.push(a),h.push(-1),h.push(1),h.push(2),h.push(f)):(m=(e-r)/(s-r),l=(e-n)/(s-n),h.push(1),h.push(-1),h.push(2),h.push(1),h.push(m),h.push(-1),h.push(0),h.push(1),h.push(l)):(c=(e-s)/(n-s),g=(e-r)/(n-r),h.push(0),h.push(-1),h.push(1),h.push(0),h.push(c),h.push(-1),h.push(2),h.push(0),h.push(g)):3!==p&&(h.push(0),h.push(1),h.push(2)),h},x=32767,w=16383,C=[],B=[],y=[],I=new n.Cartographic;let A=new n.Cartesian3;const b=[],v=[],T=[],z=[],M=[],N=new n.Cartesian3,V=new t.BoundingSphere,E=new u.OrientedBoundingBox,R=new n.Cartesian2,H=new n.Cartesian3;function O(){this.vertexBuffer=void 0,this.index=void 0,this.first=void 0,this.second=void 0,this.ratio=void 0}O.prototype.clone=function(e){return i.defined(e)||(e=new O),e.uBuffer=this.uBuffer,e.vBuffer=this.vBuffer,e.heightBuffer=this.heightBuffer,e.normalBuffer=this.normalBuffer,e.index=this.index,e.first=this.first,e.second=this.second,e.ratio=this.ratio,e},O.prototype.initializeIndexed=function(e,t,n,i,s){this.uBuffer=e,this.vBuffer=t,this.heightBuffer=n,this.normalBuffer=i,this.index=s,this.first=void 0,this.second=void 0,this.ratio=void 0},O.prototype.initializeFromClipResult=function(e,t,n){let i=t+1;return-1!==e[t]?n[e[t]].clone(this):(this.vertexBuffer=void 0,this.index=void 0,this.first=n[e[i]],++i,this.second=n[e[i]],++i,this.ratio=e[i],++i),i},O.prototype.getKey=function(){return this.isIndexed()?this.index:JSON.stringify({first:this.first.getKey(),second:this.second.getKey(),ratio:this.ratio})},O.prototype.isIndexed=function(){return i.defined(this.index)},O.prototype.getH=function(){return i.defined(this.index)?this.heightBuffer[this.index]:o.CesiumMath.lerp(this.first.getH(),this.second.getH(),this.ratio)},O.prototype.getU=function(){return i.defined(this.index)?this.uBuffer[this.index]:o.CesiumMath.lerp(this.first.getU(),this.second.getU(),this.ratio)},O.prototype.getV=function(){return i.defined(this.index)?this.vBuffer[this.index]:o.CesiumMath.lerp(this.first.getV(),this.second.getV(),this.ratio)};let S=new n.Cartesian2,U=-1;const F=[new n.Cartesian3,new n.Cartesian3],P=[new n.Cartesian3,new n.Cartesian3];function D(t,i){++U;let s=F[U],r=P[U];return s=e.AttributeCompression.octDecode(t.first.getNormalX(),t.first.getNormalY(),s),r=e.AttributeCompression.octDecode(t.second.getNormalX(),t.second.getNormalY(),r),A=n.Cartesian3.lerp(s,r,t.ratio,A),n.Cartesian3.normalize(A,A),e.AttributeCompression.octEncode(A,i),--U,i}O.prototype.getNormalX=function(){return i.defined(this.index)?this.normalBuffer[2*this.index]:(S=D(this,S),S.x)},O.prototype.getNormalY=function(){return i.defined(this.index)?this.normalBuffer[2*this.index+1]:(S=D(this,S),S.y)};const W=[];function X(e,t,n,s,r,h,o,u,d){if(0===o.length)return;let p=0,l=0;for(;l<o.length;)l=W[p++].initializeFromClipResult(o,l,u);for(let r=0;r<p;++r){const o=W[r];if(o.isIndexed())o.newIndex=h[o.index],o.uBuffer=e,o.vBuffer=t,o.heightBuffer=n,d&&(o.normalBuffer=s);else{const r=o.getKey();if(i.defined(h[r]))o.newIndex=h[r];else{const i=e.length;e.push(o.getU()),t.push(o.getV()),n.push(o.getH()),d&&(s.push(o.getNormalX()),s.push(o.getNormalY())),o.newIndex=i,h[r]=i}}}3===p?(r.push(W[0].newIndex),r.push(W[1].newIndex),r.push(W[2].newIndex)):4===p&&(r.push(W[0].newIndex),r.push(W[1].newIndex),r.push(W[2].newIndex),r.push(W[0].newIndex),r.push(W[2].newIndex),r.push(W[3].newIndex))}return W.push(new O),W.push(new O),W.push(new O),W.push(new O),d((function(e,i){const h=e.isEastChild,d=e.isNorthChild,p=h?w:0,l=h?x:w,a=d?w:0,f=d?x:w,c=b,g=v,S=T,U=M;c.length=0,g.length=0,S.length=0,U.length=0;const F=z;F.length=0;const P={},D=e.vertices;let W=e.indices;W=W.subarray(0,e.indexCountWithoutSkirts);const k=s.TerrainEncoding.clone(e.encoding),K=k.hasVertexNormals;let L=0;const Y=e.vertexCountWithoutSkirts,_=e.minimumHeight,G=e.maximumHeight,J=new Array(Y),Z=new Array(Y),j=new Array(Y),q=K?new Array(2*Y):void 0;let Q,$,ee,te,ne;for($=0,ee=0;$<Y;++$,ee+=2){const e=k.decodeTextureCoordinates(D,$,R);if(Q=k.decodeHeight(D,$),te=o.CesiumMath.clamp(e.x*x|0,0,x),ne=o.CesiumMath.clamp(e.y*x|0,0,x),j[$]=o.CesiumMath.clamp((Q-_)/(G-_)*x|0,0,x),te<20&&(te=0),ne<20&&(ne=0),x-te<20&&(te=x),x-ne<20&&(ne=x),J[$]=te,Z[$]=ne,K){const e=k.getOctEncodedNormal(D,$,H);q[ee]=e.x,q[ee+1]=e.y}(h&&te>=w||!h&&te<=w)&&(d&&ne>=w||!d&&ne<=w)&&(P[$]=L,c.push(te),g.push(ne),S.push(j[$]),K&&(U.push(q[ee]),U.push(q[ee+1])),++L)}const ie=[];ie.push(new O),ie.push(new O),ie.push(new O);const se=[];let re,he;for(se.push(new O),se.push(new O),se.push(new O),$=0;$<W.length;$+=3){const e=W[$],t=W[$+1],n=W[$+2],i=J[e],s=J[t],r=J[n];ie[0].initializeIndexed(J,Z,j,q,e),ie[1].initializeIndexed(J,Z,j,q,t),ie[2].initializeIndexed(J,Z,j,q,n);const o=m_clipTriangleAtAxisAlignedThreshold(w,h,i,s,r,C);re=0,re>=o.length||(re=se[0].initializeFromClipResult(o,re,ie),re>=o.length||(re=se[1].initializeFromClipResult(o,re,ie),re>=o.length||(re=se[2].initializeFromClipResult(o,re,ie),he=m_clipTriangleAtAxisAlignedThreshold(w,d,se[0].getV(),se[1].getV(),se[2].getV(),B),X(c,g,S,U,F,P,he,se,K),re<o.length&&(se[2].clone(se[1]),se[2].initializeFromClipResult(o,re,ie),he=m_clipTriangleAtAxisAlignedThreshold(w,d,se[0].getV(),se[1].getV(),se[2].getV(),B),X(c,g,S,U,F,P,he,se,K)))))}const oe=h?-32767:0,ue=d?-32767:0,de=[],pe=[],le=[],ae=[];let fe=Number.MAX_VALUE,ce=-fe;const ge=y;ge.length=0;const me=n.Ellipsoid.clone(e.ellipsoid),xe=n.Rectangle.clone(e.childRectangle),we=xe.north,Ce=xe.south;let Be=xe.east;const ye=xe.west;for(Be<ye&&(Be+=o.CesiumMath.TWO_PI),$=0;$<c.length;++$)te=Math.round(c[$]),te<=p?(de.push($),te=0):te>=l?(le.push($),te=x):te=2*te+oe,c[$]=te,ne=Math.round(g[$]),ne<=a?(pe.push($),ne=0):ne>=f?(ae.push($),ne=x):ne=2*ne+ue,g[$]=ne,Q=o.CesiumMath.lerp(_,G,S[$]/x),Q<fe&&(fe=Q),Q>ce&&(ce=Q),S[$]=Q,I.longitude=o.CesiumMath.lerp(ye,Be,te/x),I.latitude=o.CesiumMath.lerp(Ce,we,ne/x),I.height=Q,me.cartographicToCartesian(I,A),ge.push(A.x),ge.push(A.y),ge.push(A.z);const Ie=t.BoundingSphere.fromVertices(ge,n.Cartesian3.ZERO,3,V),Ae=u.OrientedBoundingBox.fromRectangle(xe,fe,ce,me,E),be=new s.EllipsoidalOccluder(me).computeHorizonCullingPointFromVerticesPossiblyUnderEllipsoid(Ie.center,ge,3,Ie.center,fe,N),ve=ce-fe,Te=new Uint16Array(c.length+g.length+S.length);for($=0;$<c.length;++$)Te[$]=c[$];let ze=c.length;for($=0;$<g.length;++$)Te[ze+$]=g[$];for(ze+=g.length,$=0;$<S.length;++$)Te[ze+$]=x*(S[$]-fe)/ve;const Me=r.IndexDatatype.createTypedArray(c.length,F);let Ne;if(K){const e=new Uint8Array(U);i.push(Te.buffer,Me.buffer,e.buffer),Ne=e.buffer}else i.push(Te.buffer,Me.buffer);return{vertices:Te.buffer,encodedNormals:Ne,indices:Me.buffer,minimumHeight:fe,maximumHeight:ce,westIndices:de,southIndices:pe,eastIndices:le,northIndices:ae,boundingSphere:Ie,orientedBoundingBox:Ae,horizonOcclusionPoint:be}}))}));