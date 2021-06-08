define(["exports","./GeometryOffsetAttribute-3497d4dd","./Transforms-d5dbea8d","./Cartesian2-b4b7b0b3","./ComponentDatatype-ce69354e","./CylinderGeometryLibrary-6ad5dbcf","./when-208fe5b0","./Check-5e798bbf","./GeometryAttribute-3314089a","./GeometryAttributes-b0b294d8","./IndexDatatype-da7c58eb","./Math-8386669c","./VertexFormat-7e57a3bd"],(function(t,P,k,M,z,E,N,e,I,U,S,B,m){"use strict";var Y=new M.Cartesian2,Z=new M.Cartesian3,J=new M.Cartesian3,W=new M.Cartesian3,j=new M.Cartesian3;function u(t){var e=(t=N.defaultValue(t,N.defaultValue.EMPTY_OBJECT)).length,a=t.topRadius,r=t.bottomRadius,n=N.defaultValue(t.vertexFormat,m.VertexFormat.DEFAULT),o=N.defaultValue(t.slices,128);this._length=e,this._topRadius=a,this._bottomRadius=r,this._vertexFormat=m.VertexFormat.clone(n),this._slices=o,this._offsetAttribute=t.offsetAttribute,this._workerName="createCylinderGeometry"}u.packedLength=m.VertexFormat.packedLength+5,u.pack=function(t,e,a){return a=N.defaultValue(a,0),m.VertexFormat.pack(t._vertexFormat,e,a),a+=m.VertexFormat.packedLength,e[a++]=t._length,e[a++]=t._topRadius,e[a++]=t._bottomRadius,e[a++]=t._slices,e[a]=N.defaultValue(t._offsetAttribute,-1),e};var a,d=new m.VertexFormat,p={vertexFormat:d,length:void 0,topRadius:void 0,bottomRadius:void 0,slices:void 0,offsetAttribute:void 0};u.unpack=function(t,e,a){e=N.defaultValue(e,0);var r=m.VertexFormat.unpack(t,e,d);e+=m.VertexFormat.packedLength;var n=t[e++],o=t[e++],i=t[e++],s=t[e++];e=t[e];return N.defined(a)?(a._vertexFormat=m.VertexFormat.clone(r,a._vertexFormat),a._length=n,a._topRadius=o,a._bottomRadius=i,a._slices=s,a._offsetAttribute=-1===e?void 0:e,a):(p.length=n,p.topRadius=o,p.bottomRadius=i,p.slices=s,p.offsetAttribute=-1===e?void 0:e,new u(p))},u.createGeometry=function(t){var e=t._length,a=t._topRadius,r=t._bottomRadius,n=t._vertexFormat,o=t._slices;if(!(e<=0||a<0||r<0||0===a&&0===r)){var i=o+o,s=o+i,m=i+i,u=E.CylinderGeometryLibrary.computePositions(e,a,r,o,!0),d=n.st?new Float32Array(2*m):void 0,p=n.normal?new Float32Array(3*m):void 0,y=n.tangent?new Float32Array(3*m):void 0,b=n.bitangent?new Float32Array(3*m):void 0,l=n.normal||n.tangent||n.bitangent;if(l){var f=n.tangent||n.bitangent,c=0,v=0,A=0,g=Math.atan2(r-a,e),h=Z;h.z=Math.sin(g);for(var x=Math.cos(g),_=W,C=J,F=0;F<o;F++){var w=F/o*B.CesiumMath.TWO_PI,G=x*Math.cos(w);w=x*Math.sin(w);l&&(h.x=G,h.y=w,f&&(_=M.Cartesian3.normalize(M.Cartesian3.cross(M.Cartesian3.UNIT_Z,h,_),_)),n.normal&&(p[c++]=h.x,p[c++]=h.y,p[c++]=h.z,p[c++]=h.x,p[c++]=h.y,p[c++]=h.z),n.tangent&&(y[v++]=_.x,y[v++]=_.y,y[v++]=_.z,y[v++]=_.x,y[v++]=_.y,y[v++]=_.z),n.bitangent&&(C=M.Cartesian3.normalize(M.Cartesian3.cross(h,_,C),C),b[A++]=C.x,b[A++]=C.y,b[A++]=C.z,b[A++]=C.x,b[A++]=C.y,b[A++]=C.z))}for(F=0;F<o;F++)n.normal&&(p[c++]=0,p[c++]=0,p[c++]=-1),n.tangent&&(y[v++]=1,y[v++]=0,y[v++]=0),n.bitangent&&(b[A++]=0,b[A++]=-1,b[A++]=0);for(F=0;F<o;F++)n.normal&&(p[c++]=0,p[c++]=0,p[c++]=1),n.tangent&&(y[v++]=1,y[v++]=0,y[v++]=0),n.bitangent&&(b[A++]=0,b[A++]=1,b[A++]=0)}var D=S.IndexDatatype.createTypedArray(m,12*o-12),R=0,V=0;for(F=0;F<o-1;F++)D[R++]=V,D[R++]=V+2,D[R++]=V+3,D[R++]=V,D[R++]=V+3,D[R++]=V+1,V+=2;for(D[R++]=i-2,D[R++]=0,D[R++]=1,D[R++]=i-2,D[R++]=1,D[R++]=i-1,F=1;F<o-1;F++)D[R++]=i+F+1,D[R++]=i+F,D[R++]=i;for(F=1;F<o-1;F++)D[R++]=s,D[R++]=s+F,D[R++]=s+F+1;var T=0;if(n.st){var O=Math.max(a,r);for(F=0;F<m;F++){var L=M.Cartesian3.fromArray(u,3*F,j);d[T++]=(L.x+O)/(2*O),d[T++]=(L.y+O)/(2*O)}}return g=new U.GeometryAttributes,n.position&&(g.position=new I.GeometryAttribute({componentDatatype:z.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:u})),n.normal&&(g.normal=new I.GeometryAttribute({componentDatatype:z.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:p})),n.tangent&&(g.tangent=new I.GeometryAttribute({componentDatatype:z.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:y})),n.bitangent&&(g.bitangent=new I.GeometryAttribute({componentDatatype:z.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:b})),n.st&&(g.st=new I.GeometryAttribute({componentDatatype:z.ComponentDatatype.FLOAT,componentsPerAttribute:2,values:d})),Y.x=.5*e,Y.y=Math.max(r,a),r=new k.BoundingSphere(M.Cartesian3.ZERO,M.Cartesian2.magnitude(Y)),N.defined(t._offsetAttribute)&&(e=u.length,a=new Uint8Array(e/3),e=t._offsetAttribute===P.GeometryOffsetAttribute.NONE?0:1,P.arrayFill(a,e),g.applyOffset=new I.GeometryAttribute({componentDatatype:z.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:a})),new I.Geometry({attributes:g,indices:D,primitiveType:I.PrimitiveType.TRIANGLES,boundingSphere:r,offsetAttribute:t._offsetAttribute})}},u.getUnitCylinder=function(){return a=N.defined(a)?a:u.createGeometry(new u({topRadius:1,bottomRadius:1,length:1,vertexFormat:m.VertexFormat.POSITION_ONLY}))},t.CylinderGeometry=u}));