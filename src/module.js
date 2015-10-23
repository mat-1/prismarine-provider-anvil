var readMCA = require('minecraft-mca');
var mcRegion = require('minecraft-region');
var fs = require('fs');
var Chunk = require("prismarine-chunk")("1.8");
var Vec3 = require("vec3");

async function getRegion(path,x, z) {
  var region = { x: x >> 5, z: z >> 5 };
  var regionFile = path+'/r.'+region.x+'.'+region.z+'.mca';
  var buf = fs.readFileSync(regionFile);
  var data = mcRegion(await toArrayBuffer(buf),region.x,region.z);
  return data;
}

async function getChunk(region, x, z) {
  var regions = {};
  var types = {};
  var chunk = new Chunk();

  var opts = {
    ymin: 0,
    onVoxel: function(x, y, z, block, chunkX, chunkZ) {
      var type = block.type;
      var regionKey = chunkX + ':' + chunkZ;
      if (regions[regionKey]) {
        regions[regionKey]++
      } else {
        regions[regionKey] = 1
      }
      if (types[type]) types[type]++;
        else types[type] = 1

       chunk.setBlockType(new Vec3(x,y,z),block.id);
    }
  };
  var view = readMCA(region, opts).loadChunk(x, z);
  return { regions: regions, types: types, chunk:chunk };
}

async function toArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var typedarray = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
    typedarray[i] = buffer[i];
  }
  return ab;
}

class Anvil {

  constructor(path) {
    this.path=path;
  }

  // returns a Promise. Resolve a Chunk object or reject if it hasn’t been generated
  async load(x,z) {
    console.log("Loading Chunk at ", x,z);
    if (typeof x !== "number" || typeof z !== "number") {
     throw "Missing x or z arguments."
    }
    var region = await getRegion(this.path,x,z);
    var chunk = await getChunk(region,x,z);
    return chunk
  }

  // returns a Promise. Resolve an empty object when successful
  async save(x,z,buffer) {

  }
}

module.exports = Anvil;
