define(["./GeometryOffsetAttribute-821af768","./Transforms-f15de320","./Matrix2-c6c16658","./RuntimeError-5b082e8f","./ComponentDatatype-3d0a0aac","./when-4bbc8319","./GeometryAttribute-8350368e","./GeometryAttributes-7827a6c2","./combine-e9466e32","./WebGLConstants-508b9636"],(function(e,t,n,a,i,r,o,u,s,m){"use strict";const f=new n.Cartesian3;function c(e){const t=(e=r.defaultValue(e,r.defaultValue.EMPTY_OBJECT)).minimum,a=e.maximum;this._min=n.Cartesian3.clone(t),this._max=n.Cartesian3.clone(a),this._offsetAttribute=e.offsetAttribute,this._workerName="createBoxOutlineGeometry"}c.fromDimensions=function(e){const t=(e=r.defaultValue(e,r.defaultValue.EMPTY_OBJECT)).dimensions,a=n.Cartesian3.multiplyByScalar(t,.5,new n.Cartesian3);return new c({minimum:n.Cartesian3.negate(a,new n.Cartesian3),maximum:a,offsetAttribute:e.offsetAttribute})},c.fromAxisAlignedBoundingBox=function(e){return new c({minimum:e.minimum,maximum:e.maximum})},c.packedLength=2*n.Cartesian3.packedLength+1,c.pack=function(e,t,a){return a=r.defaultValue(a,0),n.Cartesian3.pack(e._min,t,a),n.Cartesian3.pack(e._max,t,a+n.Cartesian3.packedLength),t[a+2*n.Cartesian3.packedLength]=r.defaultValue(e._offsetAttribute,-1),t};const p=new n.Cartesian3,y=new n.Cartesian3,d={minimum:p,maximum:y,offsetAttribute:void 0};return c.unpack=function(e,t,a){t=r.defaultValue(t,0);const i=n.Cartesian3.unpack(e,t,p),o=n.Cartesian3.unpack(e,t+n.Cartesian3.packedLength,y),u=e[t+2*n.Cartesian3.packedLength];return r.defined(a)?(a._min=n.Cartesian3.clone(i,a._min),a._max=n.Cartesian3.clone(o,a._max),a._offsetAttribute=-1===u?void 0:u,a):(d.offsetAttribute=-1===u?void 0:u,new c(d))},c.createGeometry=function(a){const s=a._min,m=a._max;if(n.Cartesian3.equals(s,m))return;const c=new u.GeometryAttributes,p=new Uint16Array(24),y=new Float64Array(24);y[0]=s.x,y[1]=s.y,y[2]=s.z,y[3]=m.x,y[4]=s.y,y[5]=s.z,y[6]=m.x,y[7]=m.y,y[8]=s.z,y[9]=s.x,y[10]=m.y,y[11]=s.z,y[12]=s.x,y[13]=s.y,y[14]=m.z,y[15]=m.x,y[16]=s.y,y[17]=m.z,y[18]=m.x,y[19]=m.y,y[20]=m.z,y[21]=s.x,y[22]=m.y,y[23]=m.z,c.position=new o.GeometryAttribute({componentDatatype:i.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:y}),p[0]=4,p[1]=5,p[2]=5,p[3]=6,p[4]=6,p[5]=7,p[6]=7,p[7]=4,p[8]=0,p[9]=1,p[10]=1,p[11]=2,p[12]=2,p[13]=3,p[14]=3,p[15]=0,p[16]=0,p[17]=4,p[18]=1,p[19]=5,p[20]=2,p[21]=6,p[22]=3,p[23]=7;const d=n.Cartesian3.subtract(m,s,f),l=.5*n.Cartesian3.magnitude(d);if(r.defined(a._offsetAttribute)){const t=y.length,n=new Uint8Array(t/3),r=a._offsetAttribute===e.GeometryOffsetAttribute.NONE?0:1;e.arrayFill(n,r),c.applyOffset=new o.GeometryAttribute({componentDatatype:i.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:n})}return new o.Geometry({attributes:c,indices:p,primitiveType:o.PrimitiveType.LINES,boundingSphere:new t.BoundingSphere(n.Cartesian3.ZERO,l),offsetAttribute:a._offsetAttribute})},function(e,t){return r.defined(t)&&(e=c.unpack(e,t)),c.createGeometry(e)}}));