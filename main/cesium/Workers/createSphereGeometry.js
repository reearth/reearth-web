define(["./when-208fe5b0","./Cartesian2-b4b7b0b3","./Check-5e798bbf","./EllipsoidGeometry-aea476ce","./VertexFormat-7e57a3bd","./Math-8386669c","./GeometryOffsetAttribute-3497d4dd","./Transforms-d5dbea8d","./RuntimeError-7f634f5d","./ComponentDatatype-ce69354e","./WebGLConstants-76bb35d1","./GeometryAttribute-3314089a","./GeometryAttributes-b0b294d8","./IndexDatatype-da7c58eb"],(function(i,a,e,o,n,t,r,s,d,c,l,m,u,p){"use strict";function y(e){var t=i.defaultValue(e.radius,1);e={radii:new a.Cartesian3(t,t,t),stackPartitions:e.stackPartitions,slicePartitions:e.slicePartitions,vertexFormat:e.vertexFormat};this._ellipsoidGeometry=new o.EllipsoidGeometry(e),this._workerName="createSphereGeometry"}y.packedLength=o.EllipsoidGeometry.packedLength,y.pack=function(e,t,r){return o.EllipsoidGeometry.pack(e._ellipsoidGeometry,t,r)};var G=new o.EllipsoidGeometry,b={radius:void 0,radii:new a.Cartesian3,vertexFormat:new n.VertexFormat,stackPartitions:void 0,slicePartitions:void 0};return y.unpack=function(e,t,r){return t=o.EllipsoidGeometry.unpack(e,t,G),b.vertexFormat=n.VertexFormat.clone(t._vertexFormat,b.vertexFormat),b.stackPartitions=t._stackPartitions,b.slicePartitions=t._slicePartitions,i.defined(r)?(a.Cartesian3.clone(t._radii,b.radii),r._ellipsoidGeometry=new o.EllipsoidGeometry(b),r):(b.radius=t._radii.x,new y(b))},y.createGeometry=function(e){return o.EllipsoidGeometry.createGeometry(e._ellipsoidGeometry)},function(e,t){return i.defined(t)&&(e=y.unpack(e,t)),y.createGeometry(e)}}));