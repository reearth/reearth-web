define(["./when-4bbc8319","./Matrix2-c6c16658","./GeometryOffsetAttribute-821af768","./Transforms-f15de320","./RuntimeError-5b082e8f","./ComponentDatatype-3d0a0aac","./GeometryAttribute-8350368e","./GeometryAttributes-7827a6c2","./GeometryInstance-0b07c761","./GeometryPipeline-0fb7cb2c","./IndexDatatype-ddbc25a7","./PolygonPipeline-ff4d4077","./RectangleGeometryLibrary-7bc589a2","./VertexFormat-7b982b01","./combine-e9466e32","./WebGLConstants-508b9636","./AttributeCompression-f7a901f9","./EncodedCartesian3-b1495e46","./IntersectionTests-a4e54d9a","./Plane-26e67b94","./EllipsoidRhumbLine-c6741351"],(function(t,e,n,a,o,r,i,s,l,u,c,m,p,d,g,y,f,h,b,_,A){"use strict";const x=new e.Cartesian3,w=new e.Cartesian3,C=new e.Cartesian3,v=new e.Cartesian3,R=new e.Rectangle,E=new e.Cartesian2,F=new a.BoundingSphere,G=new a.BoundingSphere;function P(t,e){const n=new i.Geometry({attributes:new s.GeometryAttributes,primitiveType:i.PrimitiveType.TRIANGLES});return n.attributes.position=new i.GeometryAttribute({componentDatatype:r.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:e.positions}),t.normal&&(n.attributes.normal=new i.GeometryAttribute({componentDatatype:r.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:e.normals})),t.tangent&&(n.attributes.tangent=new i.GeometryAttribute({componentDatatype:r.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:e.tangents})),t.bitangent&&(n.attributes.bitangent=new i.GeometryAttribute({componentDatatype:r.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:e.bitangents})),n}const V=new e.Cartesian3,L=new e.Cartesian3;function D(t,n){const a=t._vertexFormat,o=t._ellipsoid,s=n.height,l=n.width,u=n.northCap,m=n.southCap;let d=0,g=s,y=s,f=0;u&&(d=1,y-=1,f+=1),m&&(g-=1,y-=1,f+=1),f+=l*y;const h=a.position?new Float64Array(3*f):void 0,b=a.st?new Float32Array(2*f):void 0;let _=0,A=0;const R=x,F=E;let G=Number.MAX_VALUE,V=Number.MAX_VALUE,L=-Number.MAX_VALUE,D=-Number.MAX_VALUE;for(let t=d;t<g;++t)for(let e=0;e<l;++e)p.RectangleGeometryLibrary.computePosition(n,o,a.st,t,e,R,F),h[_++]=R.x,h[_++]=R.y,h[_++]=R.z,a.st&&(b[A++]=F.x,b[A++]=F.y,G=Math.min(G,F.x),V=Math.min(V,F.y),L=Math.max(L,F.x),D=Math.max(D,F.y));if(u&&(p.RectangleGeometryLibrary.computePosition(n,o,a.st,0,0,R,F),h[_++]=R.x,h[_++]=R.y,h[_++]=R.z,a.st&&(b[A++]=F.x,b[A++]=F.y,G=F.x,V=F.y,L=F.x,D=F.y)),m&&(p.RectangleGeometryLibrary.computePosition(n,o,a.st,s-1,0,R,F),h[_++]=R.x,h[_++]=R.y,h[_]=R.z,a.st&&(b[A++]=F.x,b[A]=F.y,G=Math.min(G,F.x),V=Math.min(V,F.y),L=Math.max(L,F.x),D=Math.max(D,F.y))),a.st&&(G<0||V<0||L>1||D>1))for(let t=0;t<b.length;t+=2)b[t]=(b[t]-G)/(L-G),b[t+1]=(b[t+1]-V)/(D-V);const M=function(t,n,a,o){const r=t.length,i=n.normal?new Float32Array(r):void 0,s=n.tangent?new Float32Array(r):void 0,l=n.bitangent?new Float32Array(r):void 0;let u=0;const c=v,m=C;let p=w;if(n.normal||n.tangent||n.bitangent)for(let d=0;d<r;d+=3){const r=e.Cartesian3.fromArray(t,d,x),g=u+1,y=u+2;p=a.geodeticSurfaceNormal(r,p),(n.tangent||n.bitangent)&&(e.Cartesian3.cross(e.Cartesian3.UNIT_Z,p,m),e.Matrix3.multiplyByVector(o,m,m),e.Cartesian3.normalize(m,m),n.bitangent&&e.Cartesian3.normalize(e.Cartesian3.cross(p,m,c),c)),n.normal&&(i[u]=p.x,i[g]=p.y,i[y]=p.z),n.tangent&&(s[u]=m.x,s[g]=m.y,s[y]=m.z),n.bitangent&&(l[u]=c.x,l[g]=c.y,l[y]=c.z),u+=3}return P(n,{positions:t,normals:i,tangents:s,bitangents:l})}(h,a,o,n.tangentRotationMatrix);let T=6*(l-1)*(y-1);u&&(T+=3*(l-1)),m&&(T+=3*(l-1));const O=c.IndexDatatype.createTypedArray(f,T);let N,S=0,I=0;for(N=0;N<y-1;++N){for(let t=0;t<l-1;++t){const t=S,e=t+l,n=e+1,a=t+1;O[I++]=t,O[I++]=e,O[I++]=a,O[I++]=a,O[I++]=e,O[I++]=n,++S}++S}if(u||m){let t=f-1;const e=f-1;let n,a;if(u&&m&&(t=f-2),S=0,u)for(N=0;N<l-1;N++)n=S,a=n+1,O[I++]=t,O[I++]=n,O[I++]=a,++S;if(m)for(S=(y-1)*l,N=0;N<l-1;N++)n=S,a=n+1,O[I++]=n,O[I++]=e,O[I++]=a,++S}return M.indices=O,a.st&&(M.attributes.st=new i.GeometryAttribute({componentDatatype:r.ComponentDatatype.FLOAT,componentsPerAttribute:2,values:b})),M}function M(t,e,n,a,o){return t[e++]=a[n],t[e++]=a[n+1],t[e++]=a[n+2],t[e++]=o[n],t[e++]=o[n+1],t[e]=o[n+2],t}function T(t,e,n,a){return t[e++]=a[n],t[e++]=a[n+1],t[e++]=a[n],t[e]=a[n+1],t}const O=new d.VertexFormat;function N(a,o){const s=a._shadowVolume,p=a._offsetAttribute,g=a._vertexFormat,y=a._extrudedHeight,f=a._surfaceHeight,h=a._ellipsoid,b=o.height,_=o.width;let A;if(s){const t=d.VertexFormat.clone(g,O);t.normal=!0,a._vertexFormat=t}const R=D(a,o);s&&(a._vertexFormat=g);let E=m.PolygonPipeline.scaleToGeodeticHeight(R.attributes.position.values,f,h,!1);E=new Float64Array(E);let F=E.length;const G=2*F,N=new Float64Array(G);N.set(E);const S=m.PolygonPipeline.scaleToGeodeticHeight(R.attributes.position.values,y,h);N.set(S,F),R.attributes.position.values=N;const I=g.normal?new Float32Array(G):void 0,k=g.tangent?new Float32Array(G):void 0,H=g.bitangent?new Float32Array(G):void 0,z=g.st?new Float32Array(G/3*2):void 0;let B,U,Y;if(g.normal){for(U=R.attributes.normal.values,I.set(U),A=0;A<F;A++)U[A]=-U[A];I.set(U,F),R.attributes.normal.values=I}if(s){U=R.attributes.normal.values,g.normal||(R.attributes.normal=void 0);const t=new Float32Array(G);for(A=0;A<F;A++)U[A]=-U[A];t.set(U,F),R.attributes.extrudeDirection=new i.GeometryAttribute({componentDatatype:r.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:t})}const q=t.defined(p);if(q){const t=F/3*2;let e=new Uint8Array(t);p===n.GeometryOffsetAttribute.TOP?e=n.arrayFill(e,1,0,t/2):(Y=p===n.GeometryOffsetAttribute.NONE?0:1,e=n.arrayFill(e,Y)),R.attributes.applyOffset=new i.GeometryAttribute({componentDatatype:r.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:e})}if(g.tangent){const t=R.attributes.tangent.values;for(k.set(t),A=0;A<F;A++)t[A]=-t[A];k.set(t,F),R.attributes.tangent.values=k}if(g.bitangent){const t=R.attributes.bitangent.values;H.set(t),H.set(t,F),R.attributes.bitangent.values=H}g.st&&(B=R.attributes.st.values,z.set(B),z.set(B,F/3*2),R.attributes.st.values=z);const X=R.indices,Q=X.length,W=F/3,J=c.IndexDatatype.createTypedArray(G/3,2*Q);for(J.set(X),A=0;A<Q;A+=3)J[A+Q]=X[A+2]+W,J[A+1+Q]=X[A+1]+W,J[A+2+Q]=X[A]+W;R.indices=J;const j=o.northCap,Z=o.southCap;let K=b,$=2,tt=0,et=4,nt=4;j&&($-=1,K-=1,tt+=1,et-=2,nt-=1),Z&&($-=1,K-=1,tt+=1,et-=2,nt-=1),tt+=$*_+2*K-et;const at=2*(tt+nt);let ot=new Float64Array(3*at);const rt=s?new Float32Array(3*at):void 0;let it=q?new Uint8Array(at):void 0,st=g.st?new Float32Array(2*at):void 0;const lt=p===n.GeometryOffsetAttribute.TOP;q&&!lt&&(Y=p===n.GeometryOffsetAttribute.ALL?1:0,it=n.arrayFill(it,Y));let ut=0,ct=0,mt=0,pt=0;const dt=_*K;let gt;for(A=0;A<dt;A+=_)gt=3*A,ot=M(ot,ut,gt,E,S),ut+=6,g.st&&(st=T(st,ct,2*A,B),ct+=4),s&&(mt+=3,rt[mt++]=U[gt],rt[mt++]=U[gt+1],rt[mt++]=U[gt+2]),lt&&(it[pt++]=1,pt+=1);if(Z){const t=j?dt+1:dt;for(gt=3*t,A=0;A<2;A++)ot=M(ot,ut,gt,E,S),ut+=6,g.st&&(st=T(st,ct,2*t,B),ct+=4),s&&(mt+=3,rt[mt++]=U[gt],rt[mt++]=U[gt+1],rt[mt++]=U[gt+2]),lt&&(it[pt++]=1,pt+=1)}else for(A=dt-_;A<dt;A++)gt=3*A,ot=M(ot,ut,gt,E,S),ut+=6,g.st&&(st=T(st,ct,2*A,B),ct+=4),s&&(mt+=3,rt[mt++]=U[gt],rt[mt++]=U[gt+1],rt[mt++]=U[gt+2]),lt&&(it[pt++]=1,pt+=1);for(A=dt-1;A>0;A-=_)gt=3*A,ot=M(ot,ut,gt,E,S),ut+=6,g.st&&(st=T(st,ct,2*A,B),ct+=4),s&&(mt+=3,rt[mt++]=U[gt],rt[mt++]=U[gt+1],rt[mt++]=U[gt+2]),lt&&(it[pt++]=1,pt+=1);if(j){const t=dt;for(gt=3*t,A=0;A<2;A++)ot=M(ot,ut,gt,E,S),ut+=6,g.st&&(st=T(st,ct,2*t,B),ct+=4),s&&(mt+=3,rt[mt++]=U[gt],rt[mt++]=U[gt+1],rt[mt++]=U[gt+2]),lt&&(it[pt++]=1,pt+=1)}else for(A=_-1;A>=0;A--)gt=3*A,ot=M(ot,ut,gt,E,S),ut+=6,g.st&&(st=T(st,ct,2*A,B),ct+=4),s&&(mt+=3,rt[mt++]=U[gt],rt[mt++]=U[gt+1],rt[mt++]=U[gt+2]),lt&&(it[pt++]=1,pt+=1);let yt=function(t,n,a){const o=t.length,i=n.normal?new Float32Array(o):void 0,s=n.tangent?new Float32Array(o):void 0,l=n.bitangent?new Float32Array(o):void 0;let u=0,c=0,m=0,p=!0,d=v,g=C,y=w;if(n.normal||n.tangent||n.bitangent)for(let f=0;f<o;f+=6){const h=e.Cartesian3.fromArray(t,f,x),b=e.Cartesian3.fromArray(t,(f+6)%o,V);if(p){const n=e.Cartesian3.fromArray(t,(f+3)%o,L);e.Cartesian3.subtract(b,h,b),e.Cartesian3.subtract(n,h,n),y=e.Cartesian3.normalize(e.Cartesian3.cross(n,b,y),y),p=!1}e.Cartesian3.equalsEpsilon(b,h,r.CesiumMath.EPSILON10)&&(p=!0),(n.tangent||n.bitangent)&&(d=a.geodeticSurfaceNormal(h,d),n.tangent&&(g=e.Cartesian3.normalize(e.Cartesian3.cross(d,y,g),g))),n.normal&&(i[u++]=y.x,i[u++]=y.y,i[u++]=y.z,i[u++]=y.x,i[u++]=y.y,i[u++]=y.z),n.tangent&&(s[c++]=g.x,s[c++]=g.y,s[c++]=g.z,s[c++]=g.x,s[c++]=g.y,s[c++]=g.z),n.bitangent&&(l[m++]=d.x,l[m++]=d.y,l[m++]=d.z,l[m++]=d.x,l[m++]=d.y,l[m++]=d.z)}return P(n,{positions:t,normals:i,tangents:s,bitangents:l})}(ot,g,h);g.st&&(yt.attributes.st=new i.GeometryAttribute({componentDatatype:r.ComponentDatatype.FLOAT,componentsPerAttribute:2,values:st})),s&&(yt.attributes.extrudeDirection=new i.GeometryAttribute({componentDatatype:r.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:rt})),q&&(yt.attributes.applyOffset=new i.GeometryAttribute({componentDatatype:r.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:it}));const ft=c.IndexDatatype.createTypedArray(at,6*tt);let ht,bt,_t,At;F=ot.length/3;let xt=0;for(A=0;A<F-1;A+=2){ht=A,At=(ht+2)%F;const t=e.Cartesian3.fromArray(ot,3*ht,V),n=e.Cartesian3.fromArray(ot,3*At,L);e.Cartesian3.equalsEpsilon(t,n,r.CesiumMath.EPSILON10)||(bt=(ht+1)%F,_t=(bt+2)%F,ft[xt++]=ht,ft[xt++]=bt,ft[xt++]=At,ft[xt++]=At,ft[xt++]=bt,ft[xt++]=_t)}return yt.indices=ft,yt=u.GeometryPipeline.combineInstances([new l.GeometryInstance({geometry:R}),new l.GeometryInstance({geometry:yt})]),yt[0]}const S=[new e.Cartesian3,new e.Cartesian3,new e.Cartesian3,new e.Cartesian3],I=new e.Cartographic,k=new e.Cartographic;function H(t,n,a,o,r){if(0===a)return e.Rectangle.clone(t,r);const i=p.RectangleGeometryLibrary.computeOptions(t,n,a,0,R,I),s=i.height,l=i.width,u=S;return p.RectangleGeometryLibrary.computePosition(i,o,!1,0,0,u[0]),p.RectangleGeometryLibrary.computePosition(i,o,!1,0,l-1,u[1]),p.RectangleGeometryLibrary.computePosition(i,o,!1,s-1,0,u[2]),p.RectangleGeometryLibrary.computePosition(i,o,!1,s-1,l-1,u[3]),e.Rectangle.fromCartesianArray(u,o,r)}function z(n){const a=(n=t.defaultValue(n,t.defaultValue.EMPTY_OBJECT)).rectangle,o=t.defaultValue(n.height,0),i=t.defaultValue(n.extrudedHeight,o);this._rectangle=e.Rectangle.clone(a),this._granularity=t.defaultValue(n.granularity,r.CesiumMath.RADIANS_PER_DEGREE),this._ellipsoid=e.Ellipsoid.clone(t.defaultValue(n.ellipsoid,e.Ellipsoid.WGS84)),this._surfaceHeight=Math.max(o,i),this._rotation=t.defaultValue(n.rotation,0),this._stRotation=t.defaultValue(n.stRotation,0),this._vertexFormat=d.VertexFormat.clone(t.defaultValue(n.vertexFormat,d.VertexFormat.DEFAULT)),this._extrudedHeight=Math.min(o,i),this._shadowVolume=t.defaultValue(n.shadowVolume,!1),this._workerName="createRectangleGeometry",this._offsetAttribute=n.offsetAttribute,this._rotatedRectangle=void 0,this._textureCoordinateRotationPoints=void 0}z.packedLength=e.Rectangle.packedLength+e.Ellipsoid.packedLength+d.VertexFormat.packedLength+7,z.pack=function(n,a,o){return o=t.defaultValue(o,0),e.Rectangle.pack(n._rectangle,a,o),o+=e.Rectangle.packedLength,e.Ellipsoid.pack(n._ellipsoid,a,o),o+=e.Ellipsoid.packedLength,d.VertexFormat.pack(n._vertexFormat,a,o),o+=d.VertexFormat.packedLength,a[o++]=n._granularity,a[o++]=n._surfaceHeight,a[o++]=n._rotation,a[o++]=n._stRotation,a[o++]=n._extrudedHeight,a[o++]=n._shadowVolume?1:0,a[o]=t.defaultValue(n._offsetAttribute,-1),a};const B=new e.Rectangle,U=e.Ellipsoid.clone(e.Ellipsoid.UNIT_SPHERE),Y={rectangle:B,ellipsoid:U,vertexFormat:O,granularity:void 0,height:void 0,rotation:void 0,stRotation:void 0,extrudedHeight:void 0,shadowVolume:void 0,offsetAttribute:void 0};z.unpack=function(n,a,o){a=t.defaultValue(a,0);const r=e.Rectangle.unpack(n,a,B);a+=e.Rectangle.packedLength;const i=e.Ellipsoid.unpack(n,a,U);a+=e.Ellipsoid.packedLength;const s=d.VertexFormat.unpack(n,a,O);a+=d.VertexFormat.packedLength;const l=n[a++],u=n[a++],c=n[a++],m=n[a++],p=n[a++],g=1===n[a++],y=n[a];return t.defined(o)?(o._rectangle=e.Rectangle.clone(r,o._rectangle),o._ellipsoid=e.Ellipsoid.clone(i,o._ellipsoid),o._vertexFormat=d.VertexFormat.clone(s,o._vertexFormat),o._granularity=l,o._surfaceHeight=u,o._rotation=c,o._stRotation=m,o._extrudedHeight=p,o._shadowVolume=g,o._offsetAttribute=-1===y?void 0:y,o):(Y.granularity=l,Y.height=u,Y.rotation=c,Y.stRotation=m,Y.extrudedHeight=p,Y.shadowVolume=g,Y.offsetAttribute=-1===y?void 0:y,new z(Y))},z.computeRectangle=function(n,a){const o=(n=t.defaultValue(n,t.defaultValue.EMPTY_OBJECT)).rectangle,i=t.defaultValue(n.granularity,r.CesiumMath.RADIANS_PER_DEGREE),s=t.defaultValue(n.ellipsoid,e.Ellipsoid.WGS84);return H(o,i,t.defaultValue(n.rotation,0),s,a)};const q=new e.Matrix3,X=new a.Quaternion,Q=new e.Cartographic;z.createGeometry=function(o){if(r.CesiumMath.equalsEpsilon(o._rectangle.north,o._rectangle.south,r.CesiumMath.EPSILON10)||r.CesiumMath.equalsEpsilon(o._rectangle.east,o._rectangle.west,r.CesiumMath.EPSILON10))return;let s=o._rectangle;const l=o._ellipsoid,u=o._rotation,c=o._stRotation,d=o._vertexFormat,g=p.RectangleGeometryLibrary.computeOptions(s,o._granularity,u,c,R,I,k),y=q;if(0!==c||0!==u){const t=e.Rectangle.center(s,Q),n=l.geodeticSurfaceNormalCartographic(t,V);a.Quaternion.fromAxisAngle(n,-c,X),e.Matrix3.fromQuaternion(X,y)}else e.Matrix3.clone(e.Matrix3.IDENTITY,y);const f=o._surfaceHeight,h=o._extrudedHeight,b=!r.CesiumMath.equalsEpsilon(f,h,0,r.CesiumMath.EPSILON2);let _,A;if(g.lonScalar=1/o._rectangle.width,g.latScalar=1/o._rectangle.height,g.tangentRotationMatrix=y,s=o._rectangle,b){_=N(o,g);const t=a.BoundingSphere.fromRectangle3D(s,l,f,G),e=a.BoundingSphere.fromRectangle3D(s,l,h,F);A=a.BoundingSphere.union(t,e)}else{if(_=D(o,g),_.attributes.position.values=m.PolygonPipeline.scaleToGeodeticHeight(_.attributes.position.values,f,l,!1),t.defined(o._offsetAttribute)){const t=_.attributes.position.values.length,e=new Uint8Array(t/3),a=o._offsetAttribute===n.GeometryOffsetAttribute.NONE?0:1;n.arrayFill(e,a),_.attributes.applyOffset=new i.GeometryAttribute({componentDatatype:r.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:e})}A=a.BoundingSphere.fromRectangle3D(s,l,f)}return d.position||delete _.attributes.position,new i.Geometry({attributes:_.attributes,indices:_.indices,primitiveType:_.primitiveType,boundingSphere:A,offsetAttribute:o._offsetAttribute})},z.createShadowVolume=function(t,e,n){const a=t._granularity,o=t._ellipsoid,r=e(a,o),i=n(a,o);return new z({rectangle:t._rectangle,rotation:t._rotation,ellipsoid:o,stRotation:t._stRotation,granularity:a,extrudedHeight:i,height:r,vertexFormat:d.VertexFormat.POSITION_ONLY,shadowVolume:!0})};const W=new e.Rectangle,J=[new e.Cartesian2,new e.Cartesian2,new e.Cartesian2],j=new e.Matrix2,Z=new e.Cartographic;return Object.defineProperties(z.prototype,{rectangle:{get:function(){return t.defined(this._rotatedRectangle)||(this._rotatedRectangle=H(this._rectangle,this._granularity,this._rotation,this._ellipsoid)),this._rotatedRectangle}},textureCoordinateRotationPoints:{get:function(){return t.defined(this._textureCoordinateRotationPoints)||(this._textureCoordinateRotationPoints=function(t){if(0===t._stRotation)return[0,0,0,1,1,0];const n=e.Rectangle.clone(t._rectangle,W),a=t._granularity,o=t._ellipsoid,r=H(n,a,t._rotation-t._stRotation,o,W),i=J;i[0].x=r.west,i[0].y=r.south,i[1].x=r.west,i[1].y=r.north,i[2].x=r.east,i[2].y=r.south;const s=t.rectangle,l=e.Matrix2.fromRotation(t._stRotation,j),u=e.Rectangle.center(s,Z);for(let t=0;t<3;++t){const n=i[t];n.x-=u.longitude,n.y-=u.latitude,e.Matrix2.multiplyByVector(l,n,n),n.x+=u.longitude,n.y+=u.latitude,n.x=(n.x-s.west)/s.width,n.y=(n.y-s.south)/s.height}const c=i[0],m=i[1],p=i[2],d=new Array(6);return e.Cartesian2.pack(c,d),e.Cartesian2.pack(m,d,2),e.Cartesian2.pack(p,d,4),d}(this)),this._textureCoordinateRotationPoints}}}),function(n,a){return t.defined(a)&&(n=z.unpack(n,a)),n._ellipsoid=e.Ellipsoid.clone(n._ellipsoid),n._rectangle=e.Rectangle.clone(n._rectangle),z.createGeometry(n)}}));