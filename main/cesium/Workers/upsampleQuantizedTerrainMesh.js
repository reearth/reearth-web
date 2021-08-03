define(["./AttributeCompression-9fbb8447","./Transforms-1142ce48","./Cartesian2-08065eec","./when-ad3237a0","./TerrainEncoding-cd3482b3","./IndexDatatype-9504f550","./Check-be2d5acb","./Math-5ca9b250","./OrientedBoundingBox-2cc6ca57","./createTaskProcessorWorker","./combine-1510933d","./RuntimeError-767bd866","./ComponentDatatype-a867ddaa","./WebGLConstants-1c8239cc","./EllipsoidTangentPlane-f8b1fc8b","./AxisAlignedBoundingBox-718a9087","./IntersectionTests-75083888","./Plane-bb88dd7e"],(function(s,ue,oe,g,ae,de,e,pe,le,t,i,n,r,h,u,o,a,d){"use strict";var fe_clipTriangleAtAxisAlignedThreshold=function(e,t,i,n,s,r){var h,u;g.defined(r)?r.length=0:r=[];var o,a,d,p,l,f,c=t?(h=i<e,u=n<e,s<e):(h=e<i,u=e<n,e<s);return 1===(t=h+u+c)?h?(o=(e-i)/(n-i),a=(e-i)/(s-i),r.push(1),r.push(2),1!==a&&(r.push(-1),r.push(0),r.push(2),r.push(a)),1!==o&&(r.push(-1),r.push(0),r.push(1),r.push(o))):u?(d=(e-n)/(s-n),p=(e-n)/(i-n),r.push(2),r.push(0),1!==p&&(r.push(-1),r.push(1),r.push(0),r.push(p)),1!==d&&(r.push(-1),r.push(1),r.push(2),r.push(d))):c&&(l=(e-s)/(i-s),f=(e-s)/(n-s),r.push(0),r.push(1),1!==f&&(r.push(-1),r.push(2),r.push(1),r.push(f)),1!==l&&(r.push(-1),r.push(2),r.push(0),r.push(l))):2===t?h||i===e?u||n===e?c||s===e||(a=(e-i)/(s-i),d=(e-n)/(s-n),r.push(2),r.push(-1),r.push(0),r.push(2),r.push(a),r.push(-1),r.push(1),r.push(2),r.push(d)):(f=(e-s)/(n-s),o=(e-i)/(n-i),r.push(1),r.push(-1),r.push(2),r.push(1),r.push(f),r.push(-1),r.push(0),r.push(1),r.push(o)):(p=(e-n)/(i-n),l=(e-s)/(i-s),r.push(0),r.push(-1),r.push(1),r.push(0),r.push(p),r.push(-1),r.push(2),r.push(0),r.push(l)):3!==t&&(r.push(0),r.push(1),r.push(2)),r},ce=32767,ge=16383,me=[],xe=[],we=[],Ce=new oe.Cartographic,ve=new oe.Cartesian3,Be=[],ye=[],be=[],Ie=[],Ae=[],Te=new oe.Cartesian3,ze=new ue.BoundingSphere,Me=new le.OrientedBoundingBox,Ne=new oe.Cartesian2,Ve=new oe.Cartesian3;function Ee(){this.vertexBuffer=void 0,this.index=void 0,this.first=void 0,this.second=void 0,this.ratio=void 0}Ee.prototype.clone=function(e){return(e=g.defined(e)?e:new Ee).uBuffer=this.uBuffer,e.vBuffer=this.vBuffer,e.heightBuffer=this.heightBuffer,e.normalBuffer=this.normalBuffer,e.index=this.index,e.first=this.first,e.second=this.second,e.ratio=this.ratio,e},Ee.prototype.initializeIndexed=function(e,t,i,n,s){this.uBuffer=e,this.vBuffer=t,this.heightBuffer=i,this.normalBuffer=n,this.index=s,this.first=void 0,this.second=void 0,this.ratio=void 0},Ee.prototype.initializeFromClipResult=function(e,t,i){var n=t+1;return-1!==e[t]?i[e[t]].clone(this):(this.vertexBuffer=void 0,this.index=void 0,this.first=i[e[n]],this.second=i[e[++n]],this.ratio=e[++n],++n),n},Ee.prototype.getKey=function(){return this.isIndexed()?this.index:JSON.stringify({first:this.first.getKey(),second:this.second.getKey(),ratio:this.ratio})},Ee.prototype.isIndexed=function(){return g.defined(this.index)},Ee.prototype.getH=function(){return g.defined(this.index)?this.heightBuffer[this.index]:pe.CesiumMath.lerp(this.first.getH(),this.second.getH(),this.ratio)},Ee.prototype.getU=function(){return g.defined(this.index)?this.uBuffer[this.index]:pe.CesiumMath.lerp(this.first.getU(),this.second.getU(),this.ratio)},Ee.prototype.getV=function(){return g.defined(this.index)?this.vBuffer[this.index]:pe.CesiumMath.lerp(this.first.getV(),this.second.getV(),this.ratio)};var p=new oe.Cartesian2,l=-1,f=[new oe.Cartesian3,new oe.Cartesian3],c=[new oe.Cartesian3,new oe.Cartesian3];function m(e,t){var i=f[++l],n=c[l];i=s.AttributeCompression.octDecode(e.first.getNormalX(),e.first.getNormalY(),i),n=s.AttributeCompression.octDecode(e.second.getNormalX(),e.second.getNormalY(),n);return ve=oe.Cartesian3.lerp(i,n,e.ratio,ve),oe.Cartesian3.normalize(ve,ve),s.AttributeCompression.octEncode(ve,t),--l,t}Ee.prototype.getNormalX=function(){return g.defined(this.index)?this.normalBuffer[2*this.index]:(p=m(this,p)).x},Ee.prototype.getNormalY=function(){return g.defined(this.index)?this.normalBuffer[2*this.index+1]:(p=m(this,p)).y};var x=[];function Re(e,t,i,n,s,r,h,u,o){if(0!==h.length){for(var a=0,d=0;d<h.length;)d=x[a++].initializeFromClipResult(h,d,u);for(var p=0;p<a;++p){var l,f,c=x[p];c.isIndexed()?(c.newIndex=r[c.index],c.uBuffer=e,c.vBuffer=t,c.heightBuffer=i,o&&(c.normalBuffer=n)):(l=c.getKey(),g.defined(r[l])?c.newIndex=r[l]:(f=e.length,e.push(c.getU()),t.push(c.getV()),i.push(c.getH()),o&&(n.push(c.getNormalX()),n.push(c.getNormalY())),c.newIndex=f,r[l]=f))}3===a?(s.push(x[0].newIndex),s.push(x[1].newIndex),s.push(x[2].newIndex)):4===a&&(s.push(x[0].newIndex),s.push(x[1].newIndex),s.push(x[2].newIndex),s.push(x[0].newIndex),s.push(x[2].newIndex),s.push(x[3].newIndex))}}return x.push(new Ee),x.push(new Ee),x.push(new Ee),x.push(new Ee),t((function(e,t){var i=e.isEastChild,n=e.isNorthChild,s=i?ge:0,r=i?ce:ge,h=n?ge:0,u=n?ce:ge,o=Be,a=ye,d=be,p=Ae;o.length=0,a.length=0,d.length=0,p.length=0;var l=Ie;l.length=0;for(var f={},c=e.vertices,g=(g=e.indices).subarray(0,e.indexCountWithoutSkirts),m=ae.TerrainEncoding.clone(e.encoding),x=m.hasVertexNormals,w=0,C=e.vertexCountWithoutSkirts,v=e.minimumHeight,B=e.maximumHeight,y=new Array(C),b=new Array(C),I=new Array(C),A=x?new Array(2*C):void 0,T=0,z=0;T<C;++T,z+=2){var M=m.decodeTextureCoordinates(c,T,Ne),N=m.decodeHeight(c,T),V=pe.CesiumMath.clamp(M.x*ce|0,0,ce),E=pe.CesiumMath.clamp(M.y*ce|0,0,ce);I[T]=pe.CesiumMath.clamp((N-v)/(B-v)*ce|0,0,ce),ce-(V=V<20?0:V)<20&&(V=ce),ce-(E=E<20?0:E)<20&&(E=ce),y[T]=V,b[T]=E,x&&(M=m.getOctEncodedNormal(c,T,Ve),A[z]=M.x,A[z+1]=M.y),(i&&ge<=V||!i&&V<=ge)&&(n&&ge<=E||!n&&E<=ge)&&(f[T]=w,o.push(V),a.push(E),d.push(I[T]),x&&(p.push(A[z]),p.push(A[z+1])),++w)}var R=[];R.push(new Ee),R.push(new Ee),R.push(new Ee);var H=[];for(H.push(new Ee),H.push(new Ee),H.push(new Ee),T=0;T<g.length;T+=3){var O=g[T],S=g[T+1],U=g[T+2],F=y[O],P=y[S],k=y[U];R[0].initializeIndexed(y,b,I,A,O),R[1].initializeIndexed(y,b,I,A,S),R[2].initializeIndexed(y,b,I,A,U),(P=fe_clipTriangleAtAxisAlignedThreshold(ge,i,F,P,k,me)).length<=0||(k=H[0].initializeFromClipResult(P,0,R))>=P.length||(k=H[1].initializeFromClipResult(P,k,R))>=P.length||(k=H[2].initializeFromClipResult(P,k,R),Re(o,a,d,p,l,f,fe_clipTriangleAtAxisAlignedThreshold(ge,n,H[0].getV(),H[1].getV(),H[2].getV(),xe),H,x),k<P.length&&(H[2].clone(H[1]),H[2].initializeFromClipResult(P,k,R),Re(o,a,d,p,l,f,fe_clipTriangleAtAxisAlignedThreshold(ge,n,H[0].getV(),H[1].getV(),H[2].getV(),xe),H,x)))}var D=i?-ce:0,W=n?-ce:0,X=[],K=[],L=[],Y=[],_=Number.MAX_VALUE,G=-_,J=we;J.length=0;var Z=oe.Ellipsoid.clone(e.ellipsoid),j=(he=oe.Rectangle.clone(e.childRectangle)).north,q=he.south,Q=he.east,$=he.west;for(Q<$&&(Q+=pe.CesiumMath.TWO_PI),T=0;T<o.length;++T)V=(V=Math.round(o[T]))<=s?(X.push(T),0):r<=V?(L.push(T),ce):2*V+D,o[T]=V,E=(E=Math.round(a[T]))<=h?(K.push(T),0):u<=E?(Y.push(T),ce):2*E+W,a[T]=E,(N=pe.CesiumMath.lerp(v,B,d[T]/ce))<_&&(_=N),G<N&&(G=N),d[T]=N,Ce.longitude=pe.CesiumMath.lerp($,Q,V/ce),Ce.latitude=pe.CesiumMath.lerp(q,j,E/ce),Ce.height=N,Z.cartographicToCartesian(Ce,ve),J.push(ve.x),J.push(ve.y),J.push(ve.z);var ee=ue.BoundingSphere.fromVertices(J,oe.Cartesian3.ZERO,3,ze),te=le.OrientedBoundingBox.fromRectangle(he,_,G,Z,Me),ie=(e=new ae.EllipsoidalOccluder(Z).computeHorizonCullingPointFromVerticesPossiblyUnderEllipsoid(ee.center,J,3,ee.center,_,Te),G-_),ne=new Uint16Array(o.length+a.length+d.length);for(T=0;T<o.length;++T)ne[T]=o[T];var se=o.length;for(T=0;T<a.length;++T)ne[se+T]=a[T];for(se+=a.length,T=0;T<d.length;++T)ne[se+T]=ce*(d[T]-_)/ie;var re,he=de.IndexDatatype.createTypedArray(o.length,l);return x?(re=new Uint8Array(p),t.push(ne.buffer,he.buffer,re.buffer),re=re.buffer):t.push(ne.buffer,he.buffer),{vertices:ne.buffer,encodedNormals:re,indices:he.buffer,minimumHeight:_,maximumHeight:G,westIndices:X,southIndices:K,eastIndices:L,northIndices:Y,boundingSphere:ee,orientedBoundingBox:te,horizonOcclusionPoint:e}}))}));