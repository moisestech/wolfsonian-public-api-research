var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/ngraph.forcelayout/lib/codeGenerators/getVariableName.js
var require_getVariableName = __commonJS({
  "node_modules/ngraph.forcelayout/lib/codeGenerators/getVariableName.js"(exports, module) {
    module.exports = function getVariableName(index4) {
      if (index4 === 0) return "x";
      if (index4 === 1) return "y";
      if (index4 === 2) return "z";
      return "c" + (index4 + 1);
    };
  }
});

// node_modules/ngraph.forcelayout/lib/codeGenerators/createPatternBuilder.js
var require_createPatternBuilder = __commonJS({
  "node_modules/ngraph.forcelayout/lib/codeGenerators/createPatternBuilder.js"(exports, module) {
    var getVariableName = require_getVariableName();
    module.exports = function createPatternBuilder(dimension) {
      return pattern;
      function pattern(template, config) {
        let indent = config && config.indent || 0;
        let join = config && config.join !== void 0 ? config.join : "\n";
        let indentString = Array(indent + 1).join(" ");
        let buffer = [];
        for (let i = 0; i < dimension; ++i) {
          let variableName = getVariableName(i);
          let prefix = i === 0 ? "" : indentString;
          buffer.push(prefix + template.replace(/{var}/g, variableName));
        }
        return buffer.join(join);
      }
    };
  }
});

// node_modules/ngraph.forcelayout/lib/codeGenerators/generateCreateBody.js
var require_generateCreateBody = __commonJS({
  "node_modules/ngraph.forcelayout/lib/codeGenerators/generateCreateBody.js"(exports, module) {
    var createPatternBuilder = require_createPatternBuilder();
    module.exports = generateCreateBodyFunction;
    module.exports.generateCreateBodyFunctionBody = generateCreateBodyFunctionBody;
    module.exports.getVectorCode = getVectorCode;
    module.exports.getBodyCode = getBodyCode;
    function generateCreateBodyFunction(dimension, debugSetters) {
      let code = generateCreateBodyFunctionBody(dimension, debugSetters);
      let { Body } = new Function(code)();
      return Body;
    }
    function generateCreateBodyFunctionBody(dimension, debugSetters) {
      let code = `
${getVectorCode(dimension, debugSetters)}
${getBodyCode(dimension, debugSetters)}
return {Body: Body, Vector: Vector};
`;
      return code;
    }
    function getBodyCode(dimension) {
      let pattern = createPatternBuilder(dimension);
      let variableList = pattern("{var}", { join: ", " });
      return `
function Body(${variableList}) {
  this.isPinned = false;
  this.pos = new Vector(${variableList});
  this.force = new Vector();
  this.velocity = new Vector();
  this.mass = 1;

  this.springCount = 0;
  this.springLength = 0;
}

Body.prototype.reset = function() {
  this.force.reset();
  this.springCount = 0;
  this.springLength = 0;
}

Body.prototype.setPosition = function (${variableList}) {
  ${pattern("this.pos.{var} = {var} || 0;", { indent: 2 })}
};`;
    }
    function getVectorCode(dimension, debugSetters) {
      let pattern = createPatternBuilder(dimension);
      let setters = "";
      if (debugSetters) {
        setters = `${pattern("\n   var v{var};\nObject.defineProperty(this, '{var}', {\n  set: function(v) { \n    if (!Number.isFinite(v)) throw new Error('Cannot set non-numbers to {var}');\n    v{var} = v; \n  },\n  get: function() { return v{var}; }\n});")}`;
      }
      let variableList = pattern("{var}", { join: ", " });
      return `function Vector(${variableList}) {
  ${setters}
    if (typeof arguments[0] === 'object') {
      // could be another vector
      let v = arguments[0];
      ${pattern('if (!Number.isFinite(v.{var})) throw new Error("Expected value is not a finite number at Vector constructor ({var})");', { indent: 4 })}
      ${pattern("this.{var} = v.{var};", { indent: 4 })}
    } else {
      ${pattern('this.{var} = typeof {var} === "number" ? {var} : 0;', { indent: 4 })}
    }
  }
  
  Vector.prototype.reset = function () {
    ${pattern("this.{var} = ", { join: "" })}0;
  };`;
    }
  }
});

// node_modules/ngraph.forcelayout/lib/codeGenerators/generateQuadTree.js
var require_generateQuadTree = __commonJS({
  "node_modules/ngraph.forcelayout/lib/codeGenerators/generateQuadTree.js"(exports, module) {
    var createPatternBuilder = require_createPatternBuilder();
    var getVariableName = require_getVariableName();
    module.exports = generateQuadTreeFunction;
    module.exports.generateQuadTreeFunctionBody = generateQuadTreeFunctionBody;
    module.exports.getInsertStackCode = getInsertStackCode;
    module.exports.getQuadNodeCode = getQuadNodeCode;
    module.exports.isSamePosition = isSamePosition;
    module.exports.getChildBodyCode = getChildBodyCode;
    module.exports.setChildBodyCode = setChildBodyCode;
    function generateQuadTreeFunction(dimension) {
      let code = generateQuadTreeFunctionBody(dimension);
      return new Function(code)();
    }
    function generateQuadTreeFunctionBody(dimension) {
      let pattern = createPatternBuilder(dimension);
      let quadCount = Math.pow(2, dimension);
      let code = `
${getInsertStackCode()}
${getQuadNodeCode(dimension)}
${isSamePosition(dimension)}
${getChildBodyCode(dimension)}
${setChildBodyCode(dimension)}

function createQuadTree(options, random) {
  options = options || {};
  options.gravity = typeof options.gravity === 'number' ? options.gravity : -1;
  options.theta = typeof options.theta === 'number' ? options.theta : 0.8;

  var gravity = options.gravity;
  var updateQueue = [];
  var insertStack = new InsertStack();
  var theta = options.theta;

  var nodesCache = [];
  var currentInCache = 0;
  var root = newNode();

  return {
    insertBodies: insertBodies,

    /**
     * Gets root node if it is present
     */
    getRoot: function() {
      return root;
    },

    updateBodyForce: update,

    options: function(newOptions) {
      if (newOptions) {
        if (typeof newOptions.gravity === 'number') {
          gravity = newOptions.gravity;
        }
        if (typeof newOptions.theta === 'number') {
          theta = newOptions.theta;
        }

        return this;
      }

      return {
        gravity: gravity,
        theta: theta
      };
    }
  };

  function newNode() {
    // To avoid pressure on GC we reuse nodes.
    var node = nodesCache[currentInCache];
    if (node) {
${assignQuads("      node.")}
      node.body = null;
      node.mass = ${pattern("node.mass_{var} = ", { join: "" })}0;
      ${pattern("node.min_{var} = node.max_{var} = ", { join: "" })}0;
    } else {
      node = new QuadNode();
      nodesCache[currentInCache] = node;
    }

    ++currentInCache;
    return node;
  }

  function update(sourceBody) {
    var queue = updateQueue;
    var v;
    ${pattern("var d{var};", { indent: 4 })}
    var r; 
    ${pattern("var f{var} = 0;", { indent: 4 })}
    var queueLength = 1;
    var shiftIdx = 0;
    var pushIdx = 1;

    queue[0] = root;

    while (queueLength) {
      var node = queue[shiftIdx];
      var body = node.body;

      queueLength -= 1;
      shiftIdx += 1;
      var differentBody = (body !== sourceBody);
      if (body && differentBody) {
        // If the current node is a leaf node (and it is not source body),
        // calculate the force exerted by the current node on body, and add this
        // amount to body's net force.
        ${pattern("d{var} = body.pos.{var} - sourceBody.pos.{var};", { indent: 8 })}
        r = Math.sqrt(${pattern("d{var} * d{var}", { join: " + " })});

        if (r === 0) {
          // Poor man's protection against zero distance.
          ${pattern("d{var} = (random.nextDouble() - 0.5) / 50;", { indent: 10 })}
          r = Math.sqrt(${pattern("d{var} * d{var}", { join: " + " })});
        }

        // This is standard gravitation force calculation but we divide
        // by r^3 to save two operations when normalizing force vector.
        v = gravity * body.mass * sourceBody.mass / (r * r * r);
        ${pattern("f{var} += v * d{var};", { indent: 8 })}
      } else if (differentBody) {
        // Otherwise, calculate the ratio s / r,  where s is the width of the region
        // represented by the internal node, and r is the distance between the body
        // and the node's center-of-mass
        ${pattern("d{var} = node.mass_{var} / node.mass - sourceBody.pos.{var};", { indent: 8 })}
        r = Math.sqrt(${pattern("d{var} * d{var}", { join: " + " })});

        if (r === 0) {
          // Sorry about code duplication. I don't want to create many functions
          // right away. Just want to see performance first.
          ${pattern("d{var} = (random.nextDouble() - 0.5) / 50;", { indent: 10 })}
          r = Math.sqrt(${pattern("d{var} * d{var}", { join: " + " })});
        }
        // If s / r < \u03B8, treat this internal node as a single body, and calculate the
        // force it exerts on sourceBody, and add this amount to sourceBody's net force.
        if ((node.max_${getVariableName(0)} - node.min_${getVariableName(0)}) / r < theta) {
          // in the if statement above we consider node's width only
          // because the region was made into square during tree creation.
          // Thus there is no difference between using width or height.
          v = gravity * node.mass * sourceBody.mass / (r * r * r);
          ${pattern("f{var} += v * d{var};", { indent: 10 })}
        } else {
          // Otherwise, run the procedure recursively on each of the current node's children.

          // I intentionally unfolded this loop, to save several CPU cycles.
${runRecursiveOnChildren()}
        }
      }
    }

    ${pattern("sourceBody.force.{var} += f{var};", { indent: 4 })}
  }

  function insertBodies(bodies) {
    ${pattern("var {var}min = Number.MAX_VALUE;", { indent: 4 })}
    ${pattern("var {var}max = Number.MIN_VALUE;", { indent: 4 })}
    var i = bodies.length;

    // To reduce quad tree depth we are looking for exact bounding box of all particles.
    while (i--) {
      var pos = bodies[i].pos;
      ${pattern("if (pos.{var} < {var}min) {var}min = pos.{var};", { indent: 6 })}
      ${pattern("if (pos.{var} > {var}max) {var}max = pos.{var};", { indent: 6 })}
    }

    // Makes the bounds square.
    var maxSideLength = -Infinity;
    ${pattern("if ({var}max - {var}min > maxSideLength) maxSideLength = {var}max - {var}min ;", { indent: 4 })}

    currentInCache = 0;
    root = newNode();
    ${pattern("root.min_{var} = {var}min;", { indent: 4 })}
    ${pattern("root.max_{var} = {var}min + maxSideLength;", { indent: 4 })}

    i = bodies.length - 1;
    if (i >= 0) {
      root.body = bodies[i];
    }
    while (i--) {
      insert(bodies[i], root);
    }
  }

  function insert(newBody) {
    insertStack.reset();
    insertStack.push(root, newBody);

    while (!insertStack.isEmpty()) {
      var stackItem = insertStack.pop();
      var node = stackItem.node;
      var body = stackItem.body;

      if (!node.body) {
        // This is internal node. Update the total mass of the node and center-of-mass.
        ${pattern("var {var} = body.pos.{var};", { indent: 8 })}
        node.mass += body.mass;
        ${pattern("node.mass_{var} += body.mass * {var};", { indent: 8 })}

        // Recursively insert the body in the appropriate quadrant.
        // But first find the appropriate quadrant.
        var quadIdx = 0; // Assume we are in the 0's quad.
        ${pattern("var min_{var} = node.min_{var};", { indent: 8 })}
        ${pattern("var max_{var} = (min_{var} + node.max_{var}) / 2;", { indent: 8 })}

${assignInsertionQuadIndex(8)}

        var child = getChild(node, quadIdx);

        if (!child) {
          // The node is internal but this quadrant is not taken. Add
          // subnode to it.
          child = newNode();
          ${pattern("child.min_{var} = min_{var};", { indent: 10 })}
          ${pattern("child.max_{var} = max_{var};", { indent: 10 })}
          child.body = body;

          setChild(node, quadIdx, child);
        } else {
          // continue searching in this quadrant.
          insertStack.push(child, body);
        }
      } else {
        // We are trying to add to the leaf node.
        // We have to convert current leaf into internal node
        // and continue adding two nodes.
        var oldBody = node.body;
        node.body = null; // internal nodes do not cary bodies

        if (isSamePosition(oldBody.pos, body.pos)) {
          // Prevent infinite subdivision by bumping one node
          // anywhere in this quadrant
          var retriesCount = 3;
          do {
            var offset = random.nextDouble();
            ${pattern("var d{var} = (node.max_{var} - node.min_{var}) * offset;", { indent: 12 })}

            ${pattern("oldBody.pos.{var} = node.min_{var} + d{var};", { indent: 12 })}
            retriesCount -= 1;
            // Make sure we don't bump it out of the box. If we do, next iteration should fix it
          } while (retriesCount > 0 && isSamePosition(oldBody.pos, body.pos));

          if (retriesCount === 0 && isSamePosition(oldBody.pos, body.pos)) {
            // This is very bad, we ran out of precision.
            // if we do not return from the method we'll get into
            // infinite loop here. So we sacrifice correctness of layout, and keep the app running
            // Next layout iteration should get larger bounding box in the first step and fix this
            return;
          }
        }
        // Next iteration should subdivide node further.
        insertStack.push(node, oldBody);
        insertStack.push(node, body);
      }
    }
  }
}
return createQuadTree;

`;
      return code;
      function assignInsertionQuadIndex(indentCount) {
        let insertionCode = [];
        let indent = Array(indentCount + 1).join(" ");
        for (let i = 0; i < dimension; ++i) {
          insertionCode.push(indent + `if (${getVariableName(i)} > max_${getVariableName(i)}) {`);
          insertionCode.push(indent + `  quadIdx = quadIdx + ${Math.pow(2, i)};`);
          insertionCode.push(indent + `  min_${getVariableName(i)} = max_${getVariableName(i)};`);
          insertionCode.push(indent + `  max_${getVariableName(i)} = node.max_${getVariableName(i)};`);
          insertionCode.push(indent + `}`);
        }
        return insertionCode.join("\n");
      }
      function runRecursiveOnChildren() {
        let indent = Array(11).join(" ");
        let recursiveCode = [];
        for (let i = 0; i < quadCount; ++i) {
          recursiveCode.push(indent + `if (node.quad${i}) {`);
          recursiveCode.push(indent + `  queue[pushIdx] = node.quad${i};`);
          recursiveCode.push(indent + `  queueLength += 1;`);
          recursiveCode.push(indent + `  pushIdx += 1;`);
          recursiveCode.push(indent + `}`);
        }
        return recursiveCode.join("\n");
      }
      function assignQuads(indent) {
        let quads = [];
        for (let i = 0; i < quadCount; ++i) {
          quads.push(`${indent}quad${i} = null;`);
        }
        return quads.join("\n");
      }
    }
    function isSamePosition(dimension) {
      let pattern = createPatternBuilder(dimension);
      return `
  function isSamePosition(point1, point2) {
    ${pattern("var d{var} = Math.abs(point1.{var} - point2.{var});", { indent: 2 })}
  
    return ${pattern("d{var} < 1e-8", { join: " && " })};
  }  
`;
    }
    function setChildBodyCode(dimension) {
      var quadCount = Math.pow(2, dimension);
      return `
function setChild(node, idx, child) {
  ${setChildBody()}
}`;
      function setChildBody() {
        let childBody = [];
        for (let i = 0; i < quadCount; ++i) {
          let prefix = i === 0 ? "  " : "  else ";
          childBody.push(`${prefix}if (idx === ${i}) node.quad${i} = child;`);
        }
        return childBody.join("\n");
      }
    }
    function getChildBodyCode(dimension) {
      return `function getChild(node, idx) {
${getChildBody()}
  return null;
}`;
      function getChildBody() {
        let childBody = [];
        let quadCount = Math.pow(2, dimension);
        for (let i = 0; i < quadCount; ++i) {
          childBody.push(`  if (idx === ${i}) return node.quad${i};`);
        }
        return childBody.join("\n");
      }
    }
    function getQuadNodeCode(dimension) {
      let pattern = createPatternBuilder(dimension);
      let quadCount = Math.pow(2, dimension);
      var quadNodeCode = `
function QuadNode() {
  // body stored inside this node. In quad tree only leaf nodes (by construction)
  // contain bodies:
  this.body = null;

  // Child nodes are stored in quads. Each quad is presented by number:
  // 0 | 1
  // -----
  // 2 | 3
${assignQuads("  this.")}

  // Total mass of current node
  this.mass = 0;

  // Center of mass coordinates
  ${pattern("this.mass_{var} = 0;", { indent: 2 })}

  // bounding box coordinates
  ${pattern("this.min_{var} = 0;", { indent: 2 })}
  ${pattern("this.max_{var} = 0;", { indent: 2 })}
}
`;
      return quadNodeCode;
      function assignQuads(indent) {
        let quads = [];
        for (let i = 0; i < quadCount; ++i) {
          quads.push(`${indent}quad${i} = null;`);
        }
        return quads.join("\n");
      }
    }
    function getInsertStackCode() {
      return `
/**
 * Our implementation of QuadTree is non-recursive to avoid GC hit
 * This data structure represent stack of elements
 * which we are trying to insert into quad tree.
 */
function InsertStack () {
    this.stack = [];
    this.popIdx = 0;
}

InsertStack.prototype = {
    isEmpty: function() {
        return this.popIdx === 0;
    },
    push: function (node, body) {
        var item = this.stack[this.popIdx];
        if (!item) {
            // we are trying to avoid memory pressure: create new element
            // only when absolutely necessary
            this.stack[this.popIdx] = new InsertStackElement(node, body);
        } else {
            item.node = node;
            item.body = body;
        }
        ++this.popIdx;
    },
    pop: function () {
        if (this.popIdx > 0) {
            return this.stack[--this.popIdx];
        }
    },
    reset: function () {
        this.popIdx = 0;
    }
};

function InsertStackElement(node, body) {
    this.node = node; // QuadTree node
    this.body = body; // physical body which needs to be inserted to node
}
`;
    }
  }
});

// node_modules/ngraph.forcelayout/lib/codeGenerators/generateBounds.js
var require_generateBounds = __commonJS({
  "node_modules/ngraph.forcelayout/lib/codeGenerators/generateBounds.js"(exports, module) {
    module.exports = generateBoundsFunction;
    module.exports.generateFunctionBody = generateBoundsFunctionBody;
    var createPatternBuilder = require_createPatternBuilder();
    function generateBoundsFunction(dimension) {
      let code = generateBoundsFunctionBody(dimension);
      return new Function("bodies", "settings", "random", code);
    }
    function generateBoundsFunctionBody(dimension) {
      let pattern = createPatternBuilder(dimension);
      let code = `
  var boundingBox = {
    ${pattern("min_{var}: 0, max_{var}: 0,", { indent: 4 })}
  };

  return {
    box: boundingBox,

    update: updateBoundingBox,

    reset: resetBoundingBox,

    getBestNewPosition: function (neighbors) {
      var ${pattern("base_{var} = 0", { join: ", " })};

      if (neighbors.length) {
        for (var i = 0; i < neighbors.length; ++i) {
          let neighborPos = neighbors[i].pos;
          ${pattern("base_{var} += neighborPos.{var};", { indent: 10 })}
        }

        ${pattern("base_{var} /= neighbors.length;", { indent: 8 })}
      } else {
        ${pattern("base_{var} = (boundingBox.min_{var} + boundingBox.max_{var}) / 2;", { indent: 8 })}
      }

      var springLength = settings.springLength;
      return {
        ${pattern("{var}: base_{var} + (random.nextDouble() - 0.5) * springLength,", { indent: 8 })}
      };
    }
  };

  function updateBoundingBox() {
    var i = bodies.length;
    if (i === 0) return; // No bodies - no borders.

    ${pattern("var max_{var} = -Infinity;", { indent: 4 })}
    ${pattern("var min_{var} = Infinity;", { indent: 4 })}

    while(i--) {
      // this is O(n), it could be done faster with quadtree, if we check the root node bounds
      var bodyPos = bodies[i].pos;
      ${pattern("if (bodyPos.{var} < min_{var}) min_{var} = bodyPos.{var};", { indent: 6 })}
      ${pattern("if (bodyPos.{var} > max_{var}) max_{var} = bodyPos.{var};", { indent: 6 })}
    }

    ${pattern("boundingBox.min_{var} = min_{var};", { indent: 4 })}
    ${pattern("boundingBox.max_{var} = max_{var};", { indent: 4 })}
  }

  function resetBoundingBox() {
    ${pattern("boundingBox.min_{var} = boundingBox.max_{var} = 0;", { indent: 4 })}
  }
`;
      return code;
    }
  }
});

// node_modules/ngraph.forcelayout/lib/codeGenerators/generateCreateDragForce.js
var require_generateCreateDragForce = __commonJS({
  "node_modules/ngraph.forcelayout/lib/codeGenerators/generateCreateDragForce.js"(exports, module) {
    var createPatternBuilder = require_createPatternBuilder();
    module.exports = generateCreateDragForceFunction;
    module.exports.generateCreateDragForceFunctionBody = generateCreateDragForceFunctionBody;
    function generateCreateDragForceFunction(dimension) {
      let code = generateCreateDragForceFunctionBody(dimension);
      return new Function("options", code);
    }
    function generateCreateDragForceFunctionBody(dimension) {
      let pattern = createPatternBuilder(dimension);
      let code = `
  if (!Number.isFinite(options.dragCoefficient)) throw new Error('dragCoefficient is not a finite number');

  return {
    update: function(body) {
      ${pattern("body.force.{var} -= options.dragCoefficient * body.velocity.{var};", { indent: 6 })}
    }
  };
`;
      return code;
    }
  }
});

// node_modules/ngraph.forcelayout/lib/codeGenerators/generateCreateSpringForce.js
var require_generateCreateSpringForce = __commonJS({
  "node_modules/ngraph.forcelayout/lib/codeGenerators/generateCreateSpringForce.js"(exports, module) {
    var createPatternBuilder = require_createPatternBuilder();
    module.exports = generateCreateSpringForceFunction;
    module.exports.generateCreateSpringForceFunctionBody = generateCreateSpringForceFunctionBody;
    function generateCreateSpringForceFunction(dimension) {
      let code = generateCreateSpringForceFunctionBody(dimension);
      return new Function("options", "random", code);
    }
    function generateCreateSpringForceFunctionBody(dimension) {
      let pattern = createPatternBuilder(dimension);
      let code = `
  if (!Number.isFinite(options.springCoefficient)) throw new Error('Spring coefficient is not a number');
  if (!Number.isFinite(options.springLength)) throw new Error('Spring length is not a number');

  return {
    /**
     * Updates forces acting on a spring
     */
    update: function (spring) {
      var body1 = spring.from;
      var body2 = spring.to;
      var length = spring.length < 0 ? options.springLength : spring.length;
      ${pattern("var d{var} = body2.pos.{var} - body1.pos.{var};", { indent: 6 })}
      var r = Math.sqrt(${pattern("d{var} * d{var}", { join: " + " })});

      if (r === 0) {
        ${pattern("d{var} = (random.nextDouble() - 0.5) / 50;", { indent: 8 })}
        r = Math.sqrt(${pattern("d{var} * d{var}", { join: " + " })});
      }

      var d = r - length;
      var coefficient = ((spring.coefficient > 0) ? spring.coefficient : options.springCoefficient) * d / r;

      ${pattern("body1.force.{var} += coefficient * d{var}", { indent: 6 })};
      body1.springCount += 1;
      body1.springLength += r;

      ${pattern("body2.force.{var} -= coefficient * d{var}", { indent: 6 })};
      body2.springCount += 1;
      body2.springLength += r;
    }
  };
`;
      return code;
    }
  }
});

// node_modules/ngraph.forcelayout/lib/codeGenerators/generateIntegrator.js
var require_generateIntegrator = __commonJS({
  "node_modules/ngraph.forcelayout/lib/codeGenerators/generateIntegrator.js"(exports, module) {
    var createPatternBuilder = require_createPatternBuilder();
    module.exports = generateIntegratorFunction;
    module.exports.generateIntegratorFunctionBody = generateIntegratorFunctionBody;
    function generateIntegratorFunction(dimension) {
      let code = generateIntegratorFunctionBody(dimension);
      return new Function("bodies", "timeStep", "adaptiveTimeStepWeight", code);
    }
    function generateIntegratorFunctionBody(dimension) {
      let pattern = createPatternBuilder(dimension);
      let code = `
  var length = bodies.length;
  if (length === 0) return 0;

  ${pattern("var d{var} = 0, t{var} = 0;", { indent: 2 })}

  for (var i = 0; i < length; ++i) {
    var body = bodies[i];
    if (body.isPinned) continue;

    if (adaptiveTimeStepWeight && body.springCount) {
      timeStep = (adaptiveTimeStepWeight * body.springLength/body.springCount);
    }

    var coeff = timeStep / body.mass;

    ${pattern("body.velocity.{var} += coeff * body.force.{var};", { indent: 4 })}
    ${pattern("var v{var} = body.velocity.{var};", { indent: 4 })}
    var v = Math.sqrt(${pattern("v{var} * v{var}", { join: " + " })});

    if (v > 1) {
      // We normalize it so that we move within timeStep range. 
      // for the case when v <= 1 - we let velocity to fade out.
      ${pattern("body.velocity.{var} = v{var} / v;", { indent: 6 })}
    }

    ${pattern("d{var} = timeStep * body.velocity.{var};", { indent: 4 })}

    ${pattern("body.pos.{var} += d{var};", { indent: 4 })}

    ${pattern("t{var} += Math.abs(d{var});", { indent: 4 })}
  }

  return (${pattern("t{var} * t{var}", { join: " + " })})/length;
`;
      return code;
    }
  }
});

// node_modules/ngraph.forcelayout/lib/spring.js
var require_spring = __commonJS({
  "node_modules/ngraph.forcelayout/lib/spring.js"(exports, module) {
    module.exports = Spring;
    function Spring(fromBody, toBody, length, springCoefficient) {
      this.from = fromBody;
      this.to = toBody;
      this.length = length;
      this.coefficient = springCoefficient;
    }
  }
});

// node_modules/ngraph.merge/index.js
var require_ngraph = __commonJS({
  "node_modules/ngraph.merge/index.js"(exports, module) {
    module.exports = merge;
    function merge(target, options) {
      var key;
      if (!target) {
        target = {};
      }
      if (options) {
        for (key in options) {
          if (options.hasOwnProperty(key)) {
            var targetHasIt = target.hasOwnProperty(key), optionsValueType = typeof options[key], shouldReplace = !targetHasIt || typeof target[key] !== optionsValueType;
            if (shouldReplace) {
              target[key] = options[key];
            } else if (optionsValueType === "object") {
              target[key] = merge(target[key], options[key]);
            }
          }
        }
      }
      return target;
    }
  }
});

// node_modules/ngraph.events/dist/ngraph.events.cjs
var require_ngraph_events = __commonJS({
  "node_modules/ngraph.events/dist/ngraph.events.cjs"(exports, module) {
    "use strict";
    function c3(e) {
      s(e);
      const t = a2(e);
      return e.on = t.on, e.off = t.off, e.fire = t.fire, e;
    }
    function a2(e) {
      let t = /* @__PURE__ */ Object.create(null);
      return { on: function(n, r, f) {
        if (typeof r != "function") throw new Error("callback is expected to be a function");
        let o = t[n];
        return o || (o = t[n] = []), o.push({ callback: r, ctx: f }), e;
      }, off: function(n, r) {
        if (typeof n > "u") return t = /* @__PURE__ */ Object.create(null), e;
        if (t[n]) if (typeof r != "function") delete t[n];
        else {
          const l = t[n];
          for (let i = 0; i < l.length; ++i) l[i].callback === r && l.splice(i, 1);
        }
        return e;
      }, fire: function(n) {
        const r = t[n];
        if (!r) return e;
        let f;
        arguments.length > 1 && (f = Array.prototype.slice.call(arguments, 1));
        for (let o = 0; o < r.length; ++o) {
          const l = r[o];
          l.callback.apply(l.ctx, f);
        }
        return e;
      } };
    }
    function s(e) {
      if (!e) throw new Error("Eventify cannot use falsy object as events subject");
      const t = ["on", "fire", "off"];
      for (let n = 0; n < t.length; ++n) if (e.hasOwnProperty(t[n])) throw new Error("Subject cannot be eventified, since it already has property '" + t[n] + "'");
    }
    module.exports = c3;
  }
});

// node_modules/ngraph.random/index.js
var require_ngraph2 = __commonJS({
  "node_modules/ngraph.random/index.js"(exports, module) {
    module.exports = random;
    module.exports.random = random, module.exports.randomIterator = randomIterator;
    function random(inputSeed) {
      var seed = typeof inputSeed === "number" ? inputSeed : +/* @__PURE__ */ new Date();
      return new Generator(seed);
    }
    function Generator(seed) {
      this.seed = seed;
    }
    Generator.prototype.next = next;
    Generator.prototype.nextDouble = nextDouble;
    Generator.prototype.uniform = nextDouble;
    Generator.prototype.gaussian = gaussian;
    Generator.prototype.random = nextDouble;
    function gaussian() {
      var r, x2, y2;
      do {
        x2 = this.nextDouble() * 2 - 1;
        y2 = this.nextDouble() * 2 - 1;
        r = x2 * x2 + y2 * y2;
      } while (r >= 1 || r === 0);
      return x2 * Math.sqrt(-2 * Math.log(r) / r);
    }
    Generator.prototype.levy = levy;
    function levy() {
      var beta = 3 / 2;
      var sigma = Math.pow(
        gamma2(1 + beta) * Math.sin(Math.PI * beta / 2) / (gamma2((1 + beta) / 2) * beta * Math.pow(2, (beta - 1) / 2)),
        1 / beta
      );
      return this.gaussian() * sigma / Math.pow(Math.abs(this.gaussian()), 1 / beta);
    }
    function gamma2(z2) {
      return Math.sqrt(2 * Math.PI / z2) * Math.pow(1 / Math.E * (z2 + 1 / (12 * z2 - 1 / (10 * z2))), z2);
    }
    function nextDouble() {
      var seed = this.seed;
      seed = seed + 2127912214 + (seed << 12) & 4294967295;
      seed = (seed ^ 3345072700 ^ seed >>> 19) & 4294967295;
      seed = seed + 374761393 + (seed << 5) & 4294967295;
      seed = (seed + 3550635116 ^ seed << 9) & 4294967295;
      seed = seed + 4251993797 + (seed << 3) & 4294967295;
      seed = (seed ^ 3042594569 ^ seed >>> 16) & 4294967295;
      this.seed = seed;
      return (seed & 268435455) / 268435456;
    }
    function next(maxValue) {
      return Math.floor(this.nextDouble() * maxValue);
    }
    function randomIterator(array2, customRandom) {
      var localRandom = customRandom || random();
      if (typeof localRandom.next !== "function") {
        throw new Error("customRandom does not match expected API: next() function is missing");
      }
      return {
        /**
         * Visits every single element of a collection once, in a random order.
         * Note: collection is modified in place.
         */
        forEach,
        /**
         * Shuffles array randomly, in place.
         */
        shuffle: shuffle2
      };
      function shuffle2() {
        var i, j, t;
        for (i = array2.length - 1; i > 0; --i) {
          j = localRandom.next(i + 1);
          t = array2[j];
          array2[j] = array2[i];
          array2[i] = t;
        }
        return array2;
      }
      function forEach(callback) {
        var i, j, t;
        for (i = array2.length - 1; i > 0; --i) {
          j = localRandom.next(i + 1);
          t = array2[j];
          array2[j] = array2[i];
          array2[i] = t;
          callback(t);
        }
        if (array2.length) {
          callback(array2[0]);
        }
      }
    }
  }
});

// node_modules/ngraph.forcelayout/lib/createPhysicsSimulator.js
var require_createPhysicsSimulator = __commonJS({
  "node_modules/ngraph.forcelayout/lib/createPhysicsSimulator.js"(exports, module) {
    module.exports = createPhysicsSimulator;
    var generateCreateBodyFunction = require_generateCreateBody();
    var generateQuadTreeFunction = require_generateQuadTree();
    var generateBoundsFunction = require_generateBounds();
    var generateCreateDragForceFunction = require_generateCreateDragForce();
    var generateCreateSpringForceFunction = require_generateCreateSpringForce();
    var generateIntegratorFunction = require_generateIntegrator();
    var dimensionalCache = {};
    function createPhysicsSimulator(settings) {
      var Spring = require_spring();
      var merge = require_ngraph();
      var eventify2 = require_ngraph_events();
      if (settings) {
        if (settings.springCoeff !== void 0) throw new Error("springCoeff was renamed to springCoefficient");
        if (settings.dragCoeff !== void 0) throw new Error("dragCoeff was renamed to dragCoefficient");
      }
      settings = merge(settings, {
        /**
         * Ideal length for links (springs in physical model).
         */
        springLength: 10,
        /**
         * Hook's law coefficient. 1 - solid spring.
         */
        springCoefficient: 0.8,
        /**
         * Coulomb's law coefficient. It's used to repel nodes thus should be negative
         * if you make it positive nodes start attract each other :).
         */
        gravity: -12,
        /**
         * Theta coefficient from Barnes Hut simulation. Ranged between (0, 1).
         * The closer it's to 1 the more nodes algorithm will have to go through.
         * Setting it to one makes Barnes Hut simulation no different from
         * brute-force forces calculation (each node is considered).
         */
        theta: 0.8,
        /**
         * Drag force coefficient. Used to slow down system, thus should be less than 1.
         * The closer it is to 0 the less tight system will be.
         */
        dragCoefficient: 0.9,
        // TODO: Need to rename this to something better. E.g. `dragCoefficient`
        /**
         * Default time step (dt) for forces integration
         */
        timeStep: 0.5,
        /**
         * Adaptive time step uses average spring length to compute actual time step:
         * See: https://twitter.com/anvaka/status/1293067160755957760
         */
        adaptiveTimeStepWeight: 0,
        /**
         * This parameter defines number of dimensions of the space where simulation
         * is performed. 
         */
        dimensions: 2,
        /**
         * In debug mode more checks are performed, this will help you catch errors
         * quickly, however for production build it is recommended to turn off this flag
         * to speed up computation.
         */
        debug: false
      });
      var factory = dimensionalCache[settings.dimensions];
      if (!factory) {
        var dimensions = settings.dimensions;
        factory = {
          Body: generateCreateBodyFunction(dimensions, settings.debug),
          createQuadTree: generateQuadTreeFunction(dimensions),
          createBounds: generateBoundsFunction(dimensions),
          createDragForce: generateCreateDragForceFunction(dimensions),
          createSpringForce: generateCreateSpringForceFunction(dimensions),
          integrate: generateIntegratorFunction(dimensions)
        };
        dimensionalCache[dimensions] = factory;
      }
      var Body = factory.Body;
      var createQuadTree = factory.createQuadTree;
      var createBounds = factory.createBounds;
      var createDragForce = factory.createDragForce;
      var createSpringForce = factory.createSpringForce;
      var integrate = factory.integrate;
      var createBody = (pos) => new Body(pos);
      var random = require_ngraph2().random(42);
      var bodies = [];
      var springs = [];
      var quadTree = createQuadTree(settings, random);
      var bounds = createBounds(bodies, settings, random);
      var springForce = createSpringForce(settings, random);
      var dragForce = createDragForce(settings);
      var totalMovement = 0;
      var forces = [];
      var forceMap = /* @__PURE__ */ new Map();
      var iterationNumber = 0;
      addForce("nbody", nbodyForce);
      addForce("spring", updateSpringForce);
      var publicApi = {
        /**
         * Array of bodies, registered with current simulator
         *
         * Note: To add new body, use addBody() method. This property is only
         * exposed for testing/performance purposes.
         */
        bodies,
        quadTree,
        /**
         * Array of springs, registered with current simulator
         *
         * Note: To add new spring, use addSpring() method. This property is only
         * exposed for testing/performance purposes.
         */
        springs,
        /**
         * Returns settings with which current simulator was initialized
         */
        settings,
        /**
         * Adds a new force to simulation
         */
        addForce,
        /**
         * Removes a force from the simulation.
         */
        removeForce,
        /**
         * Returns a map of all registered forces.
         */
        getForces,
        /**
         * Performs one step of force simulation.
         *
         * @returns {boolean} true if system is considered stable; False otherwise.
         */
        step: function() {
          for (var i = 0; i < forces.length; ++i) {
            forces[i](iterationNumber);
          }
          var movement = integrate(bodies, settings.timeStep, settings.adaptiveTimeStepWeight);
          iterationNumber += 1;
          return movement;
        },
        /**
         * Adds body to the system
         *
         * @param {ngraph.physics.primitives.Body} body physical body
         *
         * @returns {ngraph.physics.primitives.Body} added body
         */
        addBody: function(body) {
          if (!body) {
            throw new Error("Body is required");
          }
          bodies.push(body);
          return body;
        },
        /**
         * Adds body to the system at given position
         *
         * @param {Object} pos position of a body
         *
         * @returns {ngraph.physics.primitives.Body} added body
         */
        addBodyAt: function(pos) {
          if (!pos) {
            throw new Error("Body position is required");
          }
          var body = createBody(pos);
          bodies.push(body);
          return body;
        },
        /**
         * Removes body from the system
         *
         * @param {ngraph.physics.primitives.Body} body to remove
         *
         * @returns {Boolean} true if body found and removed. falsy otherwise;
         */
        removeBody: function(body) {
          if (!body) {
            return;
          }
          var idx = bodies.indexOf(body);
          if (idx < 0) {
            return;
          }
          bodies.splice(idx, 1);
          if (bodies.length === 0) {
            bounds.reset();
          }
          return true;
        },
        /**
         * Adds a spring to this simulation.
         *
         * @returns {Object} - a handle for a spring. If you want to later remove
         * spring pass it to removeSpring() method.
         */
        addSpring: function(body1, body2, springLength, springCoefficient) {
          if (!body1 || !body2) {
            throw new Error("Cannot add null spring to force simulator");
          }
          if (typeof springLength !== "number") {
            springLength = -1;
          }
          var spring = new Spring(body1, body2, springLength, springCoefficient >= 0 ? springCoefficient : -1);
          springs.push(spring);
          return spring;
        },
        /**
         * Returns amount of movement performed on last step() call
         */
        getTotalMovement: function() {
          return totalMovement;
        },
        /**
         * Removes spring from the system
         *
         * @param {Object} spring to remove. Spring is an object returned by addSpring
         *
         * @returns {Boolean} true if spring found and removed. falsy otherwise;
         */
        removeSpring: function(spring) {
          if (!spring) {
            return;
          }
          var idx = springs.indexOf(spring);
          if (idx > -1) {
            springs.splice(idx, 1);
            return true;
          }
        },
        getBestNewBodyPosition: function(neighbors) {
          return bounds.getBestNewPosition(neighbors);
        },
        /**
         * Returns bounding box which covers all bodies
         */
        getBBox: getBoundingBox,
        getBoundingBox,
        invalidateBBox: function() {
          console.warn("invalidateBBox() is deprecated, bounds always recomputed on `getBBox()` call");
        },
        // TODO: Move the force specific stuff to force
        gravity: function(value) {
          if (value !== void 0) {
            settings.gravity = value;
            quadTree.options({ gravity: value });
            return this;
          } else {
            return settings.gravity;
          }
        },
        theta: function(value) {
          if (value !== void 0) {
            settings.theta = value;
            quadTree.options({ theta: value });
            return this;
          } else {
            return settings.theta;
          }
        },
        /**
         * Returns pseudo-random number generator instance.
         */
        random
      };
      expose(settings, publicApi);
      eventify2(publicApi);
      return publicApi;
      function getBoundingBox() {
        bounds.update();
        return bounds.box;
      }
      function addForce(forceName, forceFunction) {
        if (forceMap.has(forceName)) throw new Error("Force " + forceName + " is already added");
        forceMap.set(forceName, forceFunction);
        forces.push(forceFunction);
      }
      function removeForce(forceName) {
        var forceIndex = forces.indexOf(forceMap.get(forceName));
        if (forceIndex < 0) return;
        forces.splice(forceIndex, 1);
        forceMap.delete(forceName);
      }
      function getForces() {
        return forceMap;
      }
      function nbodyForce() {
        if (bodies.length === 0) return;
        quadTree.insertBodies(bodies);
        var i = bodies.length;
        while (i--) {
          var body = bodies[i];
          if (!body.isPinned) {
            body.reset();
            quadTree.updateBodyForce(body);
            dragForce.update(body);
          }
        }
      }
      function updateSpringForce() {
        var i = springs.length;
        while (i--) {
          springForce.update(springs[i]);
        }
      }
    }
    function expose(settings, target) {
      for (var key in settings) {
        augment(settings, target, key);
      }
    }
    function augment(source, target, key) {
      if (!source.hasOwnProperty(key)) return;
      if (typeof target[key] === "function") {
        return;
      }
      var sourceIsNumber = Number.isFinite(source[key]);
      if (sourceIsNumber) {
        target[key] = function(value) {
          if (value !== void 0) {
            if (!Number.isFinite(value)) throw new Error("Value of " + key + " should be a valid number.");
            source[key] = value;
            return target;
          }
          return source[key];
        };
      } else {
        target[key] = function(value) {
          if (value !== void 0) {
            source[key] = value;
            return target;
          }
          return source[key];
        };
      }
    }
  }
});

// node_modules/ngraph.forcelayout/index.js
var require_ngraph3 = __commonJS({
  "node_modules/ngraph.forcelayout/index.js"(exports, module) {
    module.exports = createLayout;
    module.exports.simulator = require_createPhysicsSimulator();
    var eventify2 = require_ngraph_events();
    function createLayout(graph, physicsSettings) {
      if (!graph) {
        throw new Error("Graph structure cannot be undefined");
      }
      var createSimulator = physicsSettings && physicsSettings.createSimulator || require_createPhysicsSimulator();
      var physicsSimulator = createSimulator(physicsSettings);
      if (Array.isArray(physicsSettings)) throw new Error("Physics settings is expected to be an object");
      var nodeMass = graph.version > 19 ? defaultSetNodeMass : defaultArrayNodeMass;
      if (physicsSettings && typeof physicsSettings.nodeMass === "function") {
        nodeMass = physicsSettings.nodeMass;
      }
      var nodeBodies = /* @__PURE__ */ new Map();
      var springs = {};
      var bodiesCount = 0;
      var springTransform = physicsSimulator.settings.springTransform || noop2;
      initPhysics();
      listenToEvents();
      var wasStable = false;
      var api = {
        /**
         * Performs one step of iterative layout algorithm
         *
         * @returns {boolean} true if the system should be considered stable; False otherwise.
         * The system is stable if no further call to `step()` can improve the layout.
         */
        step: function() {
          if (bodiesCount === 0) {
            updateStableStatus(true);
            return true;
          }
          var lastMove = physicsSimulator.step();
          api.lastMove = lastMove;
          api.fire("step");
          var ratio = lastMove / bodiesCount;
          var isStableNow = ratio <= 0.01;
          updateStableStatus(isStableNow);
          return isStableNow;
        },
        /**
         * For a given `nodeId` returns position
         */
        getNodePosition: function(nodeId) {
          return getInitializedBody(nodeId).pos;
        },
        /**
         * Sets position of a node to a given coordinates
         * @param {string} nodeId node identifier
         * @param {number} x position of a node
         * @param {number} y position of a node
         * @param {number=} z position of node (only if applicable to body)
         */
        setNodePosition: function(nodeId) {
          var body = getInitializedBody(nodeId);
          body.setPosition.apply(body, Array.prototype.slice.call(arguments, 1));
        },
        /**
         * @returns {Object} Link position by link id
         * @returns {Object.from} {x, y} coordinates of link start
         * @returns {Object.to} {x, y} coordinates of link end
         */
        getLinkPosition: function(linkId) {
          var spring = springs[linkId];
          if (spring) {
            return {
              from: spring.from.pos,
              to: spring.to.pos
            };
          }
        },
        /**
         * @returns {Object} area required to fit in the graph. Object contains
         * `x1`, `y1` - top left coordinates
         * `x2`, `y2` - bottom right coordinates
         */
        getGraphRect: function() {
          return physicsSimulator.getBBox();
        },
        /**
         * Iterates over each body in the layout simulator and performs a callback(body, nodeId)
         */
        forEachBody,
        /*
         * Requests layout algorithm to pin/unpin node to its current position
         * Pinned nodes should not be affected by layout algorithm and always
         * remain at their position
         */
        pinNode: function(node, isPinned) {
          var body = getInitializedBody(node.id);
          body.isPinned = !!isPinned;
        },
        /**
         * Checks whether given graph's node is currently pinned
         */
        isNodePinned: function(node) {
          return getInitializedBody(node.id).isPinned;
        },
        /**
         * Request to release all resources
         */
        dispose: function() {
          graph.off("changed", onGraphChanged);
          api.fire("disposed");
        },
        /**
         * Gets physical body for a given node id. If node is not found undefined
         * value is returned.
         */
        getBody,
        /**
         * Gets spring for a given edge.
         *
         * @param {string} linkId link identifer. If two arguments are passed then
         * this argument is treated as formNodeId
         * @param {string=} toId when defined this parameter denotes head of the link
         * and first argument is treated as tail of the link (fromId)
         */
        getSpring,
        /**
         * Returns length of cumulative force vector. The closer this to zero - the more stable the system is
         */
        getForceVectorLength,
        /**
         * [Read only] Gets current physics simulator
         */
        simulator: physicsSimulator,
        /**
         * Gets the graph that was used for layout
         */
        graph,
        /**
         * Gets amount of movement performed during last step operation
         */
        lastMove: 0
      };
      eventify2(api);
      return api;
      function updateStableStatus(isStableNow) {
        if (wasStable !== isStableNow) {
          wasStable = isStableNow;
          onStableChanged(isStableNow);
        }
      }
      function forEachBody(cb) {
        nodeBodies.forEach(cb);
      }
      function getForceVectorLength() {
        var fx = 0, fy = 0;
        forEachBody(function(body) {
          fx += Math.abs(body.force.x);
          fy += Math.abs(body.force.y);
        });
        return Math.sqrt(fx * fx + fy * fy);
      }
      function getSpring(fromId, toId) {
        var linkId;
        if (toId === void 0) {
          if (typeof fromId !== "object") {
            linkId = fromId;
          } else {
            linkId = fromId.id;
          }
        } else {
          var link = graph.hasLink(fromId, toId);
          if (!link) return;
          linkId = link.id;
        }
        return springs[linkId];
      }
      function getBody(nodeId) {
        return nodeBodies.get(nodeId);
      }
      function listenToEvents() {
        graph.on("changed", onGraphChanged);
      }
      function onStableChanged(isStable) {
        api.fire("stable", isStable);
      }
      function onGraphChanged(changes) {
        for (var i = 0; i < changes.length; ++i) {
          var change = changes[i];
          if (change.changeType === "add") {
            if (change.node) {
              initBody(change.node.id);
            }
            if (change.link) {
              initLink(change.link);
            }
          } else if (change.changeType === "remove") {
            if (change.node) {
              releaseNode(change.node);
            }
            if (change.link) {
              releaseLink(change.link);
            }
          }
        }
        bodiesCount = graph.getNodesCount();
      }
      function initPhysics() {
        bodiesCount = 0;
        graph.forEachNode(function(node) {
          initBody(node.id);
          bodiesCount += 1;
        });
        graph.forEachLink(initLink);
      }
      function initBody(nodeId) {
        var body = nodeBodies.get(nodeId);
        if (!body) {
          var node = graph.getNode(nodeId);
          if (!node) {
            throw new Error("initBody() was called with unknown node id");
          }
          var pos = node.position;
          if (!pos) {
            var neighbors = getNeighborBodies(node);
            pos = physicsSimulator.getBestNewBodyPosition(neighbors);
          }
          body = physicsSimulator.addBodyAt(pos);
          body.id = nodeId;
          nodeBodies.set(nodeId, body);
          updateBodyMass(nodeId);
          if (isNodeOriginallyPinned(node)) {
            body.isPinned = true;
          }
        }
      }
      function releaseNode(node) {
        var nodeId = node.id;
        var body = nodeBodies.get(nodeId);
        if (body) {
          nodeBodies.delete(nodeId);
          physicsSimulator.removeBody(body);
        }
      }
      function initLink(link) {
        updateBodyMass(link.fromId);
        updateBodyMass(link.toId);
        var fromBody = nodeBodies.get(link.fromId), toBody = nodeBodies.get(link.toId), spring = physicsSimulator.addSpring(fromBody, toBody, link.length);
        springTransform(link, spring);
        springs[link.id] = spring;
      }
      function releaseLink(link) {
        var spring = springs[link.id];
        if (spring) {
          var from = graph.getNode(link.fromId), to = graph.getNode(link.toId);
          if (from) updateBodyMass(from.id);
          if (to) updateBodyMass(to.id);
          delete springs[link.id];
          physicsSimulator.removeSpring(spring);
        }
      }
      function getNeighborBodies(node) {
        var neighbors = [];
        if (!node.links) {
          return neighbors;
        }
        var maxNeighbors = Math.min(node.links.length, 2);
        for (var i = 0; i < maxNeighbors; ++i) {
          var link = node.links[i];
          var otherBody = link.fromId !== node.id ? nodeBodies.get(link.fromId) : nodeBodies.get(link.toId);
          if (otherBody && otherBody.pos) {
            neighbors.push(otherBody);
          }
        }
        return neighbors;
      }
      function updateBodyMass(nodeId) {
        var body = nodeBodies.get(nodeId);
        body.mass = nodeMass(nodeId);
        if (Number.isNaN(body.mass)) {
          throw new Error("Node mass should be a number");
        }
      }
      function isNodeOriginallyPinned(node) {
        return node && (node.isPinned || node.data && node.data.isPinned);
      }
      function getInitializedBody(nodeId) {
        var body = nodeBodies.get(nodeId);
        if (!body) {
          initBody(nodeId);
          body = nodeBodies.get(nodeId);
        }
        return body;
      }
      function defaultArrayNodeMass(nodeId) {
        var links = graph.getLinks(nodeId);
        if (!links) return 1;
        return 1 + links.length / 3;
      }
      function defaultSetNodeMass(nodeId) {
        var links = graph.getLinks(nodeId);
        if (!links) return 1;
        return 1 + links.size / 3;
      }
    }
    function noop2() {
    }
  }
});

// node_modules/three-forcegraph/dist/three-forcegraph.mjs
import { BufferGeometry, Mesh, SphereGeometry, Color as Color2, MeshLambertMaterial, BufferAttribute, Line, Group, CylinderGeometry, Matrix4, Box3, CubicBezierCurve3, QuadraticBezierCurve3, LineBasicMaterial, ConeGeometry, TubeGeometry, Vector3 } from "three";

// node_modules/d3-force-3d/src/center.js
function center_default(x2, y2, z2) {
  var nodes, strength = 1;
  if (x2 == null) x2 = 0;
  if (y2 == null) y2 = 0;
  if (z2 == null) z2 = 0;
  function force() {
    var i, n = nodes.length, node, sx = 0, sy = 0, sz = 0;
    for (i = 0; i < n; ++i) {
      node = nodes[i], sx += node.x || 0, sy += node.y || 0, sz += node.z || 0;
    }
    for (sx = (sx / n - x2) * strength, sy = (sy / n - y2) * strength, sz = (sz / n - z2) * strength, i = 0; i < n; ++i) {
      node = nodes[i];
      if (sx) {
        node.x -= sx;
      }
      if (sy) {
        node.y -= sy;
      }
      if (sz) {
        node.z -= sz;
      }
    }
  }
  force.initialize = function(_) {
    nodes = _;
  };
  force.x = function(_) {
    return arguments.length ? (x2 = +_, force) : x2;
  };
  force.y = function(_) {
    return arguments.length ? (y2 = +_, force) : y2;
  };
  force.z = function(_) {
    return arguments.length ? (z2 = +_, force) : z2;
  };
  force.strength = function(_) {
    return arguments.length ? (strength = +_, force) : strength;
  };
  return force;
}

// node_modules/d3-binarytree/src/add.js
function add_default(d) {
  const x2 = +this._x.call(null, d);
  return add(this.cover(x2), x2, d);
}
function add(tree, x2, d) {
  if (isNaN(x2)) return tree;
  var parent, node = tree._root, leaf = { data: d }, x0 = tree._x0, x1 = tree._x1, xm, xp, right, i, j;
  if (!node) return tree._root = leaf, tree;
  while (node.length) {
    if (right = x2 >= (xm = (x0 + x1) / 2)) x0 = xm;
    else x1 = xm;
    if (parent = node, !(node = node[i = +right])) return parent[i] = leaf, tree;
  }
  xp = +tree._x.call(null, node.data);
  if (x2 === xp) return leaf.next = node, parent ? parent[i] = leaf : tree._root = leaf, tree;
  do {
    parent = parent ? parent[i] = new Array(2) : tree._root = new Array(2);
    if (right = x2 >= (xm = (x0 + x1) / 2)) x0 = xm;
    else x1 = xm;
  } while ((i = +right) === (j = +(xp >= xm)));
  return parent[j] = node, parent[i] = leaf, tree;
}
function addAll(data) {
  if (!Array.isArray(data)) data = Array.from(data);
  const n = data.length;
  const xz = new Float64Array(n);
  let x0 = Infinity, x1 = -Infinity;
  for (let i = 0, x2; i < n; ++i) {
    if (isNaN(x2 = +this._x.call(null, data[i]))) continue;
    xz[i] = x2;
    if (x2 < x0) x0 = x2;
    if (x2 > x1) x1 = x2;
  }
  if (x0 > x1) return this;
  this.cover(x0).cover(x1);
  for (let i = 0; i < n; ++i) {
    add(this, xz[i], data[i]);
  }
  return this;
}

// node_modules/d3-binarytree/src/cover.js
function cover_default(x2) {
  if (isNaN(x2 = +x2)) return this;
  var x0 = this._x0, x1 = this._x1;
  if (isNaN(x0)) {
    x1 = (x0 = Math.floor(x2)) + 1;
  } else {
    var z2 = x1 - x0 || 1, node = this._root, parent, i;
    while (x0 > x2 || x2 >= x1) {
      i = +(x2 < x0);
      parent = new Array(2), parent[i] = node, node = parent, z2 *= 2;
      switch (i) {
        case 0:
          x1 = x0 + z2;
          break;
        case 1:
          x0 = x1 - z2;
          break;
      }
    }
    if (this._root && this._root.length) this._root = node;
  }
  this._x0 = x0;
  this._x1 = x1;
  return this;
}

// node_modules/d3-binarytree/src/data.js
function data_default() {
  var data = [];
  this.visit(function(node) {
    if (!node.length) do
      data.push(node.data);
    while (node = node.next);
  });
  return data;
}

// node_modules/d3-binarytree/src/extent.js
function extent_default(_) {
  return arguments.length ? this.cover(+_[0][0]).cover(+_[1][0]) : isNaN(this._x0) ? void 0 : [[this._x0], [this._x1]];
}

// node_modules/d3-binarytree/src/half.js
function half_default(node, x0, x1) {
  this.node = node;
  this.x0 = x0;
  this.x1 = x1;
}

// node_modules/d3-binarytree/src/find.js
function find_default(x2, radius) {
  var data, x0 = this._x0, x1, x22, x3 = this._x1, halves = [], node = this._root, q, i;
  if (node) halves.push(new half_default(node, x0, x3));
  if (radius == null) radius = Infinity;
  else {
    x0 = x2 - radius;
    x3 = x2 + radius;
  }
  while (q = halves.pop()) {
    if (!(node = q.node) || (x1 = q.x0) > x3 || (x22 = q.x1) < x0) continue;
    if (node.length) {
      var xm = (x1 + x22) / 2;
      halves.push(
        new half_default(node[1], xm, x22),
        new half_default(node[0], x1, xm)
      );
      if (i = +(x2 >= xm)) {
        q = halves[halves.length - 1];
        halves[halves.length - 1] = halves[halves.length - 1 - i];
        halves[halves.length - 1 - i] = q;
      }
    } else {
      var d = Math.abs(x2 - +this._x.call(null, node.data));
      if (d < radius) {
        radius = d;
        x0 = x2 - d;
        x3 = x2 + d;
        data = node.data;
      }
    }
  }
  return data;
}

// node_modules/d3-binarytree/src/remove.js
function remove_default(d) {
  if (isNaN(x2 = +this._x.call(null, d))) return this;
  var parent, node = this._root, retainer, previous, next, x0 = this._x0, x1 = this._x1, x2, xm, right, i, j;
  if (!node) return this;
  if (node.length) while (true) {
    if (right = x2 >= (xm = (x0 + x1) / 2)) x0 = xm;
    else x1 = xm;
    if (!(parent = node, node = node[i = +right])) return this;
    if (!node.length) break;
    if (parent[i + 1 & 1]) retainer = parent, j = i;
  }
  while (node.data !== d) if (!(previous = node, node = node.next)) return this;
  if (next = node.next) delete node.next;
  if (previous) return next ? previous.next = next : delete previous.next, this;
  if (!parent) return this._root = next, this;
  next ? parent[i] = next : delete parent[i];
  if ((node = parent[0] || parent[1]) && node === (parent[1] || parent[0]) && !node.length) {
    if (retainer) retainer[j] = node;
    else this._root = node;
  }
  return this;
}
function removeAll(data) {
  for (var i = 0, n = data.length; i < n; ++i) this.remove(data[i]);
  return this;
}

// node_modules/d3-binarytree/src/root.js
function root_default() {
  return this._root;
}

// node_modules/d3-binarytree/src/size.js
function size_default() {
  var size = 0;
  this.visit(function(node) {
    if (!node.length) do
      ++size;
    while (node = node.next);
  });
  return size;
}

// node_modules/d3-binarytree/src/visit.js
function visit_default(callback) {
  var halves = [], q, node = this._root, child, x0, x1;
  if (node) halves.push(new half_default(node, this._x0, this._x1));
  while (q = halves.pop()) {
    if (!callback(node = q.node, x0 = q.x0, x1 = q.x1) && node.length) {
      var xm = (x0 + x1) / 2;
      if (child = node[1]) halves.push(new half_default(child, xm, x1));
      if (child = node[0]) halves.push(new half_default(child, x0, xm));
    }
  }
  return this;
}

// node_modules/d3-binarytree/src/visitAfter.js
function visitAfter_default(callback) {
  var halves = [], next = [], q;
  if (this._root) halves.push(new half_default(this._root, this._x0, this._x1));
  while (q = halves.pop()) {
    var node = q.node;
    if (node.length) {
      var child, x0 = q.x0, x1 = q.x1, xm = (x0 + x1) / 2;
      if (child = node[0]) halves.push(new half_default(child, x0, xm));
      if (child = node[1]) halves.push(new half_default(child, xm, x1));
    }
    next.push(q);
  }
  while (q = next.pop()) {
    callback(q.node, q.x0, q.x1);
  }
  return this;
}

// node_modules/d3-binarytree/src/x.js
function defaultX(d) {
  return d[0];
}
function x_default(_) {
  return arguments.length ? (this._x = _, this) : this._x;
}

// node_modules/d3-binarytree/src/binarytree.js
function binarytree(nodes, x2) {
  var tree = new Binarytree(x2 == null ? defaultX : x2, NaN, NaN);
  return nodes == null ? tree : tree.addAll(nodes);
}
function Binarytree(x2, x0, x1) {
  this._x = x2;
  this._x0 = x0;
  this._x1 = x1;
  this._root = void 0;
}
function leaf_copy(leaf) {
  var copy = { data: leaf.data }, next = copy;
  while (leaf = leaf.next) next = next.next = { data: leaf.data };
  return copy;
}
var treeProto = binarytree.prototype = Binarytree.prototype;
treeProto.copy = function() {
  var copy = new Binarytree(this._x, this._x0, this._x1), node = this._root, nodes, child;
  if (!node) return copy;
  if (!node.length) return copy._root = leaf_copy(node), copy;
  nodes = [{ source: node, target: copy._root = new Array(2) }];
  while (node = nodes.pop()) {
    for (var i = 0; i < 2; ++i) {
      if (child = node.source[i]) {
        if (child.length) nodes.push({ source: child, target: node.target[i] = new Array(2) });
        else node.target[i] = leaf_copy(child);
      }
    }
  }
  return copy;
};
treeProto.add = add_default;
treeProto.addAll = addAll;
treeProto.cover = cover_default;
treeProto.data = data_default;
treeProto.extent = extent_default;
treeProto.find = find_default;
treeProto.remove = remove_default;
treeProto.removeAll = removeAll;
treeProto.root = root_default;
treeProto.size = size_default;
treeProto.visit = visit_default;
treeProto.visitAfter = visitAfter_default;
treeProto.x = x_default;

// node_modules/d3-quadtree/dist/d3-quadtree.mjs
function tree_add(d) {
  const x2 = +this._x.call(null, d), y2 = +this._y.call(null, d);
  return add2(this.cover(x2, y2), x2, y2, d);
}
function add2(tree, x2, y2, d) {
  if (isNaN(x2) || isNaN(y2)) return tree;
  var parent, node = tree._root, leaf = { data: d }, x0 = tree._x0, y0 = tree._y0, x1 = tree._x1, y1 = tree._y1, xm, ym, xp, yp, right, bottom, i, j;
  if (!node) return tree._root = leaf, tree;
  while (node.length) {
    if (right = x2 >= (xm = (x0 + x1) / 2)) x0 = xm;
    else x1 = xm;
    if (bottom = y2 >= (ym = (y0 + y1) / 2)) y0 = ym;
    else y1 = ym;
    if (parent = node, !(node = node[i = bottom << 1 | right])) return parent[i] = leaf, tree;
  }
  xp = +tree._x.call(null, node.data);
  yp = +tree._y.call(null, node.data);
  if (x2 === xp && y2 === yp) return leaf.next = node, parent ? parent[i] = leaf : tree._root = leaf, tree;
  do {
    parent = parent ? parent[i] = new Array(4) : tree._root = new Array(4);
    if (right = x2 >= (xm = (x0 + x1) / 2)) x0 = xm;
    else x1 = xm;
    if (bottom = y2 >= (ym = (y0 + y1) / 2)) y0 = ym;
    else y1 = ym;
  } while ((i = bottom << 1 | right) === (j = (yp >= ym) << 1 | xp >= xm));
  return parent[j] = node, parent[i] = leaf, tree;
}
function addAll2(data) {
  if (!Array.isArray(data)) data = Array.from(data);
  const n = data.length;
  const xz = new Float64Array(n);
  const yz = new Float64Array(n);
  let x0 = Infinity, y0 = x0, x1 = -x0, y1 = x1;
  for (let i = 0, d, x2, y2; i < n; ++i) {
    if (isNaN(x2 = +this._x.call(null, d = data[i])) || isNaN(y2 = +this._y.call(null, d))) {
      xz[i] = NaN;
      continue;
    }
    xz[i] = x2;
    yz[i] = y2;
    if (x2 < x0) x0 = x2;
    if (x2 > x1) x1 = x2;
    if (y2 < y0) y0 = y2;
    if (y2 > y1) y1 = y2;
  }
  if (x0 > x1 || y0 > y1) return this;
  this.cover(x0, y0).cover(x1, y1);
  for (let i = 0; i < n; ++i) {
    add2(this, xz[i], yz[i], data[i]);
  }
  return this;
}
function tree_cover(x2, y2) {
  if (isNaN(x2 = +x2) || isNaN(y2 = +y2)) return this;
  var x0 = this._x0, y0 = this._y0, x1 = this._x1, y1 = this._y1;
  if (isNaN(x0)) {
    x1 = (x0 = Math.floor(x2)) + 1;
    y1 = (y0 = Math.floor(y2)) + 1;
  } else {
    var z2 = x1 - x0 || 1, node = this._root, parent, i;
    while (x0 > x2 || x2 >= x1 || y0 > y2 || y2 >= y1) {
      i = (y2 < y0) << 1 | x2 < x0;
      parent = new Array(4), parent[i] = node, node = parent, z2 *= 2;
      switch (i) {
        case 0:
          x1 = x0 + z2, y1 = y0 + z2;
          break;
        case 1:
          x0 = x1 - z2, y1 = y0 + z2;
          break;
        case 2:
          x1 = x0 + z2, y0 = y1 - z2;
          break;
        case 3:
          x0 = x1 - z2, y0 = y1 - z2;
          break;
      }
    }
    if (this._root && this._root.length) this._root = node;
  }
  this._x0 = x0;
  this._y0 = y0;
  this._x1 = x1;
  this._y1 = y1;
  return this;
}
function tree_data() {
  var data = [];
  this.visit(function(node) {
    if (!node.length) do
      data.push(node.data);
    while (node = node.next);
  });
  return data;
}
function tree_extent(_) {
  return arguments.length ? this.cover(+_[0][0], +_[0][1]).cover(+_[1][0], +_[1][1]) : isNaN(this._x0) ? void 0 : [[this._x0, this._y0], [this._x1, this._y1]];
}
function Quad(node, x0, y0, x1, y1) {
  this.node = node;
  this.x0 = x0;
  this.y0 = y0;
  this.x1 = x1;
  this.y1 = y1;
}
function tree_find(x2, y2, radius) {
  var data, x0 = this._x0, y0 = this._y0, x1, y1, x22, y22, x3 = this._x1, y3 = this._y1, quads = [], node = this._root, q, i;
  if (node) quads.push(new Quad(node, x0, y0, x3, y3));
  if (radius == null) radius = Infinity;
  else {
    x0 = x2 - radius, y0 = y2 - radius;
    x3 = x2 + radius, y3 = y2 + radius;
    radius *= radius;
  }
  while (q = quads.pop()) {
    if (!(node = q.node) || (x1 = q.x0) > x3 || (y1 = q.y0) > y3 || (x22 = q.x1) < x0 || (y22 = q.y1) < y0) continue;
    if (node.length) {
      var xm = (x1 + x22) / 2, ym = (y1 + y22) / 2;
      quads.push(
        new Quad(node[3], xm, ym, x22, y22),
        new Quad(node[2], x1, ym, xm, y22),
        new Quad(node[1], xm, y1, x22, ym),
        new Quad(node[0], x1, y1, xm, ym)
      );
      if (i = (y2 >= ym) << 1 | x2 >= xm) {
        q = quads[quads.length - 1];
        quads[quads.length - 1] = quads[quads.length - 1 - i];
        quads[quads.length - 1 - i] = q;
      }
    } else {
      var dx = x2 - +this._x.call(null, node.data), dy = y2 - +this._y.call(null, node.data), d2 = dx * dx + dy * dy;
      if (d2 < radius) {
        var d = Math.sqrt(radius = d2);
        x0 = x2 - d, y0 = y2 - d;
        x3 = x2 + d, y3 = y2 + d;
        data = node.data;
      }
    }
  }
  return data;
}
function tree_remove(d) {
  if (isNaN(x2 = +this._x.call(null, d)) || isNaN(y2 = +this._y.call(null, d))) return this;
  var parent, node = this._root, retainer, previous, next, x0 = this._x0, y0 = this._y0, x1 = this._x1, y1 = this._y1, x2, y2, xm, ym, right, bottom, i, j;
  if (!node) return this;
  if (node.length) while (true) {
    if (right = x2 >= (xm = (x0 + x1) / 2)) x0 = xm;
    else x1 = xm;
    if (bottom = y2 >= (ym = (y0 + y1) / 2)) y0 = ym;
    else y1 = ym;
    if (!(parent = node, node = node[i = bottom << 1 | right])) return this;
    if (!node.length) break;
    if (parent[i + 1 & 3] || parent[i + 2 & 3] || parent[i + 3 & 3]) retainer = parent, j = i;
  }
  while (node.data !== d) if (!(previous = node, node = node.next)) return this;
  if (next = node.next) delete node.next;
  if (previous) return next ? previous.next = next : delete previous.next, this;
  if (!parent) return this._root = next, this;
  next ? parent[i] = next : delete parent[i];
  if ((node = parent[0] || parent[1] || parent[2] || parent[3]) && node === (parent[3] || parent[2] || parent[1] || parent[0]) && !node.length) {
    if (retainer) retainer[j] = node;
    else this._root = node;
  }
  return this;
}
function removeAll2(data) {
  for (var i = 0, n = data.length; i < n; ++i) this.remove(data[i]);
  return this;
}
function tree_root() {
  return this._root;
}
function tree_size() {
  var size = 0;
  this.visit(function(node) {
    if (!node.length) do
      ++size;
    while (node = node.next);
  });
  return size;
}
function tree_visit(callback) {
  var quads = [], q, node = this._root, child, x0, y0, x1, y1;
  if (node) quads.push(new Quad(node, this._x0, this._y0, this._x1, this._y1));
  while (q = quads.pop()) {
    if (!callback(node = q.node, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1) && node.length) {
      var xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
      if (child = node[3]) quads.push(new Quad(child, xm, ym, x1, y1));
      if (child = node[2]) quads.push(new Quad(child, x0, ym, xm, y1));
      if (child = node[1]) quads.push(new Quad(child, xm, y0, x1, ym));
      if (child = node[0]) quads.push(new Quad(child, x0, y0, xm, ym));
    }
  }
  return this;
}
function tree_visitAfter(callback) {
  var quads = [], next = [], q;
  if (this._root) quads.push(new Quad(this._root, this._x0, this._y0, this._x1, this._y1));
  while (q = quads.pop()) {
    var node = q.node;
    if (node.length) {
      var child, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1, xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
      if (child = node[0]) quads.push(new Quad(child, x0, y0, xm, ym));
      if (child = node[1]) quads.push(new Quad(child, xm, y0, x1, ym));
      if (child = node[2]) quads.push(new Quad(child, x0, ym, xm, y1));
      if (child = node[3]) quads.push(new Quad(child, xm, ym, x1, y1));
    }
    next.push(q);
  }
  while (q = next.pop()) {
    callback(q.node, q.x0, q.y0, q.x1, q.y1);
  }
  return this;
}
function defaultX2(d) {
  return d[0];
}
function tree_x(_) {
  return arguments.length ? (this._x = _, this) : this._x;
}
function defaultY(d) {
  return d[1];
}
function tree_y(_) {
  return arguments.length ? (this._y = _, this) : this._y;
}
function quadtree(nodes, x2, y2) {
  var tree = new Quadtree(x2 == null ? defaultX2 : x2, y2 == null ? defaultY : y2, NaN, NaN, NaN, NaN);
  return nodes == null ? tree : tree.addAll(nodes);
}
function Quadtree(x2, y2, x0, y0, x1, y1) {
  this._x = x2;
  this._y = y2;
  this._x0 = x0;
  this._y0 = y0;
  this._x1 = x1;
  this._y1 = y1;
  this._root = void 0;
}
function leaf_copy2(leaf) {
  var copy = { data: leaf.data }, next = copy;
  while (leaf = leaf.next) next = next.next = { data: leaf.data };
  return copy;
}
var treeProto2 = quadtree.prototype = Quadtree.prototype;
treeProto2.copy = function() {
  var copy = new Quadtree(this._x, this._y, this._x0, this._y0, this._x1, this._y1), node = this._root, nodes, child;
  if (!node) return copy;
  if (!node.length) return copy._root = leaf_copy2(node), copy;
  nodes = [{ source: node, target: copy._root = new Array(4) }];
  while (node = nodes.pop()) {
    for (var i = 0; i < 4; ++i) {
      if (child = node.source[i]) {
        if (child.length) nodes.push({ source: child, target: node.target[i] = new Array(4) });
        else node.target[i] = leaf_copy2(child);
      }
    }
  }
  return copy;
};
treeProto2.add = tree_add;
treeProto2.addAll = addAll2;
treeProto2.cover = tree_cover;
treeProto2.data = tree_data;
treeProto2.extent = tree_extent;
treeProto2.find = tree_find;
treeProto2.remove = tree_remove;
treeProto2.removeAll = removeAll2;
treeProto2.root = tree_root;
treeProto2.size = tree_size;
treeProto2.visit = tree_visit;
treeProto2.visitAfter = tree_visitAfter;
treeProto2.x = tree_x;
treeProto2.y = tree_y;

// node_modules/d3-octree/src/add.js
function add_default2(d) {
  const x2 = +this._x.call(null, d), y2 = +this._y.call(null, d), z2 = +this._z.call(null, d);
  return add3(this.cover(x2, y2, z2), x2, y2, z2, d);
}
function add3(tree, x2, y2, z2, d) {
  if (isNaN(x2) || isNaN(y2) || isNaN(z2)) return tree;
  var parent, node = tree._root, leaf = { data: d }, x0 = tree._x0, y0 = tree._y0, z0 = tree._z0, x1 = tree._x1, y1 = tree._y1, z1 = tree._z1, xm, ym, zm, xp, yp, zp, right, bottom, deep, i, j;
  if (!node) return tree._root = leaf, tree;
  while (node.length) {
    if (right = x2 >= (xm = (x0 + x1) / 2)) x0 = xm;
    else x1 = xm;
    if (bottom = y2 >= (ym = (y0 + y1) / 2)) y0 = ym;
    else y1 = ym;
    if (deep = z2 >= (zm = (z0 + z1) / 2)) z0 = zm;
    else z1 = zm;
    if (parent = node, !(node = node[i = deep << 2 | bottom << 1 | right])) return parent[i] = leaf, tree;
  }
  xp = +tree._x.call(null, node.data);
  yp = +tree._y.call(null, node.data);
  zp = +tree._z.call(null, node.data);
  if (x2 === xp && y2 === yp && z2 === zp) return leaf.next = node, parent ? parent[i] = leaf : tree._root = leaf, tree;
  do {
    parent = parent ? parent[i] = new Array(8) : tree._root = new Array(8);
    if (right = x2 >= (xm = (x0 + x1) / 2)) x0 = xm;
    else x1 = xm;
    if (bottom = y2 >= (ym = (y0 + y1) / 2)) y0 = ym;
    else y1 = ym;
    if (deep = z2 >= (zm = (z0 + z1) / 2)) z0 = zm;
    else z1 = zm;
  } while ((i = deep << 2 | bottom << 1 | right) === (j = (zp >= zm) << 2 | (yp >= ym) << 1 | xp >= xm));
  return parent[j] = node, parent[i] = leaf, tree;
}
function addAll3(data) {
  if (!Array.isArray(data)) data = Array.from(data);
  const n = data.length;
  const xz = new Float64Array(n);
  const yz = new Float64Array(n);
  const zz = new Float64Array(n);
  let x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity;
  for (let i = 0, d, x2, y2, z2; i < n; ++i) {
    if (isNaN(x2 = +this._x.call(null, d = data[i])) || isNaN(y2 = +this._y.call(null, d)) || isNaN(z2 = +this._z.call(null, d))) continue;
    xz[i] = x2;
    yz[i] = y2;
    zz[i] = z2;
    if (x2 < x0) x0 = x2;
    if (x2 > x1) x1 = x2;
    if (y2 < y0) y0 = y2;
    if (y2 > y1) y1 = y2;
    if (z2 < z0) z0 = z2;
    if (z2 > z1) z1 = z2;
  }
  if (x0 > x1 || y0 > y1 || z0 > z1) return this;
  this.cover(x0, y0, z0).cover(x1, y1, z1);
  for (let i = 0; i < n; ++i) {
    add3(this, xz[i], yz[i], zz[i], data[i]);
  }
  return this;
}

// node_modules/d3-octree/src/cover.js
function cover_default2(x2, y2, z2) {
  if (isNaN(x2 = +x2) || isNaN(y2 = +y2) || isNaN(z2 = +z2)) return this;
  var x0 = this._x0, y0 = this._y0, z0 = this._z0, x1 = this._x1, y1 = this._y1, z1 = this._z1;
  if (isNaN(x0)) {
    x1 = (x0 = Math.floor(x2)) + 1;
    y1 = (y0 = Math.floor(y2)) + 1;
    z1 = (z0 = Math.floor(z2)) + 1;
  } else {
    var t = x1 - x0 || 1, node = this._root, parent, i;
    while (x0 > x2 || x2 >= x1 || y0 > y2 || y2 >= y1 || z0 > z2 || z2 >= z1) {
      i = (z2 < z0) << 2 | (y2 < y0) << 1 | x2 < x0;
      parent = new Array(8), parent[i] = node, node = parent, t *= 2;
      switch (i) {
        case 0:
          x1 = x0 + t, y1 = y0 + t, z1 = z0 + t;
          break;
        case 1:
          x0 = x1 - t, y1 = y0 + t, z1 = z0 + t;
          break;
        case 2:
          x1 = x0 + t, y0 = y1 - t, z1 = z0 + t;
          break;
        case 3:
          x0 = x1 - t, y0 = y1 - t, z1 = z0 + t;
          break;
        case 4:
          x1 = x0 + t, y1 = y0 + t, z0 = z1 - t;
          break;
        case 5:
          x0 = x1 - t, y1 = y0 + t, z0 = z1 - t;
          break;
        case 6:
          x1 = x0 + t, y0 = y1 - t, z0 = z1 - t;
          break;
        case 7:
          x0 = x1 - t, y0 = y1 - t, z0 = z1 - t;
          break;
      }
    }
    if (this._root && this._root.length) this._root = node;
  }
  this._x0 = x0;
  this._y0 = y0;
  this._z0 = z0;
  this._x1 = x1;
  this._y1 = y1;
  this._z1 = z1;
  return this;
}

// node_modules/d3-octree/src/data.js
function data_default2() {
  var data = [];
  this.visit(function(node) {
    if (!node.length) do
      data.push(node.data);
    while (node = node.next);
  });
  return data;
}

// node_modules/d3-octree/src/extent.js
function extent_default2(_) {
  return arguments.length ? this.cover(+_[0][0], +_[0][1], +_[0][2]).cover(+_[1][0], +_[1][1], +_[1][2]) : isNaN(this._x0) ? void 0 : [[this._x0, this._y0, this._z0], [this._x1, this._y1, this._z1]];
}

// node_modules/d3-octree/src/octant.js
function octant_default(node, x0, y0, z0, x1, y1, z1) {
  this.node = node;
  this.x0 = x0;
  this.y0 = y0;
  this.z0 = z0;
  this.x1 = x1;
  this.y1 = y1;
  this.z1 = z1;
}

// node_modules/d3-octree/src/find.js
function find_default2(x2, y2, z2, radius) {
  var data, x0 = this._x0, y0 = this._y0, z0 = this._z0, x1, y1, z1, x22, y22, z22, x3 = this._x1, y3 = this._y1, z3 = this._z1, octs = [], node = this._root, q, i;
  if (node) octs.push(new octant_default(node, x0, y0, z0, x3, y3, z3));
  if (radius == null) radius = Infinity;
  else {
    x0 = x2 - radius, y0 = y2 - radius, z0 = z2 - radius;
    x3 = x2 + radius, y3 = y2 + radius, z3 = z2 + radius;
    radius *= radius;
  }
  while (q = octs.pop()) {
    if (!(node = q.node) || (x1 = q.x0) > x3 || (y1 = q.y0) > y3 || (z1 = q.z0) > z3 || (x22 = q.x1) < x0 || (y22 = q.y1) < y0 || (z22 = q.z1) < z0) continue;
    if (node.length) {
      var xm = (x1 + x22) / 2, ym = (y1 + y22) / 2, zm = (z1 + z22) / 2;
      octs.push(
        new octant_default(node[7], xm, ym, zm, x22, y22, z22),
        new octant_default(node[6], x1, ym, zm, xm, y22, z22),
        new octant_default(node[5], xm, y1, zm, x22, ym, z22),
        new octant_default(node[4], x1, y1, zm, xm, ym, z22),
        new octant_default(node[3], xm, ym, z1, x22, y22, zm),
        new octant_default(node[2], x1, ym, z1, xm, y22, zm),
        new octant_default(node[1], xm, y1, z1, x22, ym, zm),
        new octant_default(node[0], x1, y1, z1, xm, ym, zm)
      );
      if (i = (z2 >= zm) << 2 | (y2 >= ym) << 1 | x2 >= xm) {
        q = octs[octs.length - 1];
        octs[octs.length - 1] = octs[octs.length - 1 - i];
        octs[octs.length - 1 - i] = q;
      }
    } else {
      var dx = x2 - +this._x.call(null, node.data), dy = y2 - +this._y.call(null, node.data), dz = z2 - +this._z.call(null, node.data), d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < radius) {
        var d = Math.sqrt(radius = d2);
        x0 = x2 - d, y0 = y2 - d, z0 = z2 - d;
        x3 = x2 + d, y3 = y2 + d, z3 = z2 + d;
        data = node.data;
      }
    }
  }
  return data;
}

// node_modules/d3-octree/src/findAll.js
var distance = (x1, y1, z1, x2, y2, z2) => Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2);
function findAllWithinRadius(x2, y2, z2, radius) {
  const result = [];
  const xMin = x2 - radius;
  const yMin = y2 - radius;
  const zMin = z2 - radius;
  const xMax = x2 + radius;
  const yMax = y2 + radius;
  const zMax = z2 + radius;
  this.visit((node, x1, y1, z1, x22, y22, z22) => {
    if (!node.length) {
      do {
        const d = node.data;
        if (distance(x2, y2, z2, this._x(d), this._y(d), this._z(d)) <= radius) {
          result.push(d);
        }
      } while (node = node.next);
    }
    return x1 > xMax || y1 > yMax || z1 > zMax || x22 < xMin || y22 < yMin || z22 < zMin;
  });
  return result;
}

// node_modules/d3-octree/src/remove.js
function remove_default2(d) {
  if (isNaN(x2 = +this._x.call(null, d)) || isNaN(y2 = +this._y.call(null, d)) || isNaN(z2 = +this._z.call(null, d))) return this;
  var parent, node = this._root, retainer, previous, next, x0 = this._x0, y0 = this._y0, z0 = this._z0, x1 = this._x1, y1 = this._y1, z1 = this._z1, x2, y2, z2, xm, ym, zm, right, bottom, deep, i, j;
  if (!node) return this;
  if (node.length) while (true) {
    if (right = x2 >= (xm = (x0 + x1) / 2)) x0 = xm;
    else x1 = xm;
    if (bottom = y2 >= (ym = (y0 + y1) / 2)) y0 = ym;
    else y1 = ym;
    if (deep = z2 >= (zm = (z0 + z1) / 2)) z0 = zm;
    else z1 = zm;
    if (!(parent = node, node = node[i = deep << 2 | bottom << 1 | right])) return this;
    if (!node.length) break;
    if (parent[i + 1 & 7] || parent[i + 2 & 7] || parent[i + 3 & 7] || parent[i + 4 & 7] || parent[i + 5 & 7] || parent[i + 6 & 7] || parent[i + 7 & 7]) retainer = parent, j = i;
  }
  while (node.data !== d) if (!(previous = node, node = node.next)) return this;
  if (next = node.next) delete node.next;
  if (previous) return next ? previous.next = next : delete previous.next, this;
  if (!parent) return this._root = next, this;
  next ? parent[i] = next : delete parent[i];
  if ((node = parent[0] || parent[1] || parent[2] || parent[3] || parent[4] || parent[5] || parent[6] || parent[7]) && node === (parent[7] || parent[6] || parent[5] || parent[4] || parent[3] || parent[2] || parent[1] || parent[0]) && !node.length) {
    if (retainer) retainer[j] = node;
    else this._root = node;
  }
  return this;
}
function removeAll3(data) {
  for (var i = 0, n = data.length; i < n; ++i) this.remove(data[i]);
  return this;
}

// node_modules/d3-octree/src/root.js
function root_default2() {
  return this._root;
}

// node_modules/d3-octree/src/size.js
function size_default2() {
  var size = 0;
  this.visit(function(node) {
    if (!node.length) do
      ++size;
    while (node = node.next);
  });
  return size;
}

// node_modules/d3-octree/src/visit.js
function visit_default2(callback) {
  var octs = [], q, node = this._root, child, x0, y0, z0, x1, y1, z1;
  if (node) octs.push(new octant_default(node, this._x0, this._y0, this._z0, this._x1, this._y1, this._z1));
  while (q = octs.pop()) {
    if (!callback(node = q.node, x0 = q.x0, y0 = q.y0, z0 = q.z0, x1 = q.x1, y1 = q.y1, z1 = q.z1) && node.length) {
      var xm = (x0 + x1) / 2, ym = (y0 + y1) / 2, zm = (z0 + z1) / 2;
      if (child = node[7]) octs.push(new octant_default(child, xm, ym, zm, x1, y1, z1));
      if (child = node[6]) octs.push(new octant_default(child, x0, ym, zm, xm, y1, z1));
      if (child = node[5]) octs.push(new octant_default(child, xm, y0, zm, x1, ym, z1));
      if (child = node[4]) octs.push(new octant_default(child, x0, y0, zm, xm, ym, z1));
      if (child = node[3]) octs.push(new octant_default(child, xm, ym, z0, x1, y1, zm));
      if (child = node[2]) octs.push(new octant_default(child, x0, ym, z0, xm, y1, zm));
      if (child = node[1]) octs.push(new octant_default(child, xm, y0, z0, x1, ym, zm));
      if (child = node[0]) octs.push(new octant_default(child, x0, y0, z0, xm, ym, zm));
    }
  }
  return this;
}

// node_modules/d3-octree/src/visitAfter.js
function visitAfter_default2(callback) {
  var octs = [], next = [], q;
  if (this._root) octs.push(new octant_default(this._root, this._x0, this._y0, this._z0, this._x1, this._y1, this._z1));
  while (q = octs.pop()) {
    var node = q.node;
    if (node.length) {
      var child, x0 = q.x0, y0 = q.y0, z0 = q.z0, x1 = q.x1, y1 = q.y1, z1 = q.z1, xm = (x0 + x1) / 2, ym = (y0 + y1) / 2, zm = (z0 + z1) / 2;
      if (child = node[0]) octs.push(new octant_default(child, x0, y0, z0, xm, ym, zm));
      if (child = node[1]) octs.push(new octant_default(child, xm, y0, z0, x1, ym, zm));
      if (child = node[2]) octs.push(new octant_default(child, x0, ym, z0, xm, y1, zm));
      if (child = node[3]) octs.push(new octant_default(child, xm, ym, z0, x1, y1, zm));
      if (child = node[4]) octs.push(new octant_default(child, x0, y0, zm, xm, ym, z1));
      if (child = node[5]) octs.push(new octant_default(child, xm, y0, zm, x1, ym, z1));
      if (child = node[6]) octs.push(new octant_default(child, x0, ym, zm, xm, y1, z1));
      if (child = node[7]) octs.push(new octant_default(child, xm, ym, zm, x1, y1, z1));
    }
    next.push(q);
  }
  while (q = next.pop()) {
    callback(q.node, q.x0, q.y0, q.z0, q.x1, q.y1, q.z1);
  }
  return this;
}

// node_modules/d3-octree/src/x.js
function defaultX3(d) {
  return d[0];
}
function x_default2(_) {
  return arguments.length ? (this._x = _, this) : this._x;
}

// node_modules/d3-octree/src/y.js
function defaultY2(d) {
  return d[1];
}
function y_default(_) {
  return arguments.length ? (this._y = _, this) : this._y;
}

// node_modules/d3-octree/src/z.js
function defaultZ(d) {
  return d[2];
}
function z_default(_) {
  return arguments.length ? (this._z = _, this) : this._z;
}

// node_modules/d3-octree/src/octree.js
function octree(nodes, x2, y2, z2) {
  var tree = new Octree(x2 == null ? defaultX3 : x2, y2 == null ? defaultY2 : y2, z2 == null ? defaultZ : z2, NaN, NaN, NaN, NaN, NaN, NaN);
  return nodes == null ? tree : tree.addAll(nodes);
}
function Octree(x2, y2, z2, x0, y0, z0, x1, y1, z1) {
  this._x = x2;
  this._y = y2;
  this._z = z2;
  this._x0 = x0;
  this._y0 = y0;
  this._z0 = z0;
  this._x1 = x1;
  this._y1 = y1;
  this._z1 = z1;
  this._root = void 0;
}
function leaf_copy3(leaf) {
  var copy = { data: leaf.data }, next = copy;
  while (leaf = leaf.next) next = next.next = { data: leaf.data };
  return copy;
}
var treeProto3 = octree.prototype = Octree.prototype;
treeProto3.copy = function() {
  var copy = new Octree(this._x, this._y, this._z, this._x0, this._y0, this._z0, this._x1, this._y1, this._z1), node = this._root, nodes, child;
  if (!node) return copy;
  if (!node.length) return copy._root = leaf_copy3(node), copy;
  nodes = [{ source: node, target: copy._root = new Array(8) }];
  while (node = nodes.pop()) {
    for (var i = 0; i < 8; ++i) {
      if (child = node.source[i]) {
        if (child.length) nodes.push({ source: child, target: node.target[i] = new Array(8) });
        else node.target[i] = leaf_copy3(child);
      }
    }
  }
  return copy;
};
treeProto3.add = add_default2;
treeProto3.addAll = addAll3;
treeProto3.cover = cover_default2;
treeProto3.data = data_default2;
treeProto3.extent = extent_default2;
treeProto3.find = find_default2;
treeProto3.findAllWithinRadius = findAllWithinRadius;
treeProto3.remove = remove_default2;
treeProto3.removeAll = removeAll3;
treeProto3.root = root_default2;
treeProto3.size = size_default2;
treeProto3.visit = visit_default2;
treeProto3.visitAfter = visitAfter_default2;
treeProto3.x = x_default2;
treeProto3.y = y_default;
treeProto3.z = z_default;

// node_modules/d3-force-3d/src/constant.js
function constant_default(x2) {
  return function() {
    return x2;
  };
}

// node_modules/d3-force-3d/src/jiggle.js
function jiggle_default(random) {
  return (random() - 0.5) * 1e-6;
}

// node_modules/d3-force-3d/src/link.js
function index(d) {
  return d.index;
}
function find(nodeById, nodeId) {
  var node = nodeById.get(nodeId);
  if (!node) throw new Error("node not found: " + nodeId);
  return node;
}
function link_default(links) {
  var id = index, strength = defaultStrength, strengths, distance2 = constant_default(30), distances, nodes, nDim, count, bias, random, iterations = 1;
  if (links == null) links = [];
  function defaultStrength(link) {
    return 1 / Math.min(count[link.source.index], count[link.target.index]);
  }
  function force(alpha) {
    for (var k = 0, n = links.length; k < iterations; ++k) {
      for (var i = 0, link, source, target, x2 = 0, y2 = 0, z2 = 0, l, b; i < n; ++i) {
        link = links[i], source = link.source, target = link.target;
        x2 = target.x + target.vx - source.x - source.vx || jiggle_default(random);
        if (nDim > 1) {
          y2 = target.y + target.vy - source.y - source.vy || jiggle_default(random);
        }
        if (nDim > 2) {
          z2 = target.z + target.vz - source.z - source.vz || jiggle_default(random);
        }
        l = Math.sqrt(x2 * x2 + y2 * y2 + z2 * z2);
        l = (l - distances[i]) / l * alpha * strengths[i];
        x2 *= l, y2 *= l, z2 *= l;
        target.vx -= x2 * (b = bias[i]);
        if (nDim > 1) {
          target.vy -= y2 * b;
        }
        if (nDim > 2) {
          target.vz -= z2 * b;
        }
        source.vx += x2 * (b = 1 - b);
        if (nDim > 1) {
          source.vy += y2 * b;
        }
        if (nDim > 2) {
          source.vz += z2 * b;
        }
      }
    }
  }
  function initialize() {
    if (!nodes) return;
    var i, n = nodes.length, m2 = links.length, nodeById = new Map(nodes.map((d, i2) => [id(d, i2, nodes), d])), link;
    for (i = 0, count = new Array(n); i < m2; ++i) {
      link = links[i], link.index = i;
      if (typeof link.source !== "object") link.source = find(nodeById, link.source);
      if (typeof link.target !== "object") link.target = find(nodeById, link.target);
      count[link.source.index] = (count[link.source.index] || 0) + 1;
      count[link.target.index] = (count[link.target.index] || 0) + 1;
    }
    for (i = 0, bias = new Array(m2); i < m2; ++i) {
      link = links[i], bias[i] = count[link.source.index] / (count[link.source.index] + count[link.target.index]);
    }
    strengths = new Array(m2), initializeStrength();
    distances = new Array(m2), initializeDistance();
  }
  function initializeStrength() {
    if (!nodes) return;
    for (var i = 0, n = links.length; i < n; ++i) {
      strengths[i] = +strength(links[i], i, links);
    }
  }
  function initializeDistance() {
    if (!nodes) return;
    for (var i = 0, n = links.length; i < n; ++i) {
      distances[i] = +distance2(links[i], i, links);
    }
  }
  force.initialize = function(_nodes, ...args) {
    nodes = _nodes;
    random = args.find((arg) => typeof arg === "function") || Math.random;
    nDim = args.find((arg) => [1, 2, 3].includes(arg)) || 2;
    initialize();
  };
  force.links = function(_) {
    return arguments.length ? (links = _, initialize(), force) : links;
  };
  force.id = function(_) {
    return arguments.length ? (id = _, force) : id;
  };
  force.iterations = function(_) {
    return arguments.length ? (iterations = +_, force) : iterations;
  };
  force.strength = function(_) {
    return arguments.length ? (strength = typeof _ === "function" ? _ : constant_default(+_), initializeStrength(), force) : strength;
  };
  force.distance = function(_) {
    return arguments.length ? (distance2 = typeof _ === "function" ? _ : constant_default(+_), initializeDistance(), force) : distance2;
  };
  return force;
}

// node_modules/d3-dispatch/dist/d3-dispatch.mjs
var noop = { value: () => {
} };
function dispatch() {
  for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
    if (!(t = arguments[i] + "") || t in _ || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
    _[t] = [];
  }
  return new Dispatch(_);
}
function Dispatch(_) {
  this._ = _;
}
function parseTypenames(typenames, types) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    return { type: t, name };
  });
}
Dispatch.prototype = dispatch.prototype = {
  constructor: Dispatch,
  on: function(typename, callback) {
    var _ = this._, T = parseTypenames(typename + "", _), t, i = -1, n = T.length;
    if (arguments.length < 2) {
      while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
      return;
    }
    if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
    while (++i < n) {
      if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);
      else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
    }
    return this;
  },
  copy: function() {
    var copy = {}, _ = this._;
    for (var t in _) copy[t] = _[t].slice();
    return new Dispatch(copy);
  },
  call: function(type, that) {
    if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  },
  apply: function(type, that, args) {
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  }
};
function get(type, name) {
  for (var i = 0, n = type.length, c3; i < n; ++i) {
    if ((c3 = type[i]).name === name) {
      return c3.value;
    }
  }
}
function set(type, name, callback) {
  for (var i = 0, n = type.length; i < n; ++i) {
    if (type[i].name === name) {
      type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
      break;
    }
  }
  if (callback != null) type.push({ name, value: callback });
  return type;
}

// node_modules/d3-timer/dist/d3-timer.mjs
var frame = 0;
var timeout$1 = 0;
var interval$1 = 0;
var pokeDelay = 1e3;
var taskHead;
var taskTail;
var clockLast = 0;
var clockNow = 0;
var clockSkew = 0;
var clock = typeof performance === "object" && performance.now ? performance : Date;
var setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) {
  setTimeout(f, 17);
};
function now() {
  return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
}
function clearNow() {
  clockNow = 0;
}
function Timer() {
  this._call = this._time = this._next = null;
}
Timer.prototype = timer.prototype = {
  constructor: Timer,
  restart: function(callback, delay, time) {
    if (typeof callback !== "function") throw new TypeError("callback is not a function");
    time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
    if (!this._next && taskTail !== this) {
      if (taskTail) taskTail._next = this;
      else taskHead = this;
      taskTail = this;
    }
    this._call = callback;
    this._time = time;
    sleep();
  },
  stop: function() {
    if (this._call) {
      this._call = null;
      this._time = Infinity;
      sleep();
    }
  }
};
function timer(callback, delay, time) {
  var t = new Timer();
  t.restart(callback, delay, time);
  return t;
}
function timerFlush() {
  now();
  ++frame;
  var t = taskHead, e;
  while (t) {
    if ((e = clockNow - t._time) >= 0) t._call.call(void 0, e);
    t = t._next;
  }
  --frame;
}
function wake() {
  clockNow = (clockLast = clock.now()) + clockSkew;
  frame = timeout$1 = 0;
  try {
    timerFlush();
  } finally {
    frame = 0;
    nap();
    clockNow = 0;
  }
}
function poke() {
  var now3 = clock.now(), delay = now3 - clockLast;
  if (delay > pokeDelay) clockSkew -= delay, clockLast = now3;
}
function nap() {
  var t02, t12 = taskHead, t22, time = Infinity;
  while (t12) {
    if (t12._call) {
      if (time > t12._time) time = t12._time;
      t02 = t12, t12 = t12._next;
    } else {
      t22 = t12._next, t12._next = null;
      t12 = t02 ? t02._next = t22 : taskHead = t22;
    }
  }
  taskTail = t02;
  sleep(time);
}
function sleep(time) {
  if (frame) return;
  if (timeout$1) timeout$1 = clearTimeout(timeout$1);
  var delay = time - clockNow;
  if (delay > 24) {
    if (time < Infinity) timeout$1 = setTimeout(wake, Math.ceil(time - clock.now() - clockSkew) + 1);
    if (interval$1) interval$1 = clearInterval(interval$1);
  } else {
    if (!interval$1) clockLast = clock.now(), interval$1 = setInterval(poke, pokeDelay);
    frame = 1, setFrame(wake);
  }
}

// node_modules/d3-force-3d/src/lcg.js
var a = 1664525;
var c = 1013904223;
var m = 4294967296;
function lcg_default() {
  let s = 1;
  return () => (s = (a * s + c) % m) / m;
}

// node_modules/d3-force-3d/src/simulation.js
var MAX_DIMENSIONS = 3;
function x(d) {
  return d.x;
}
function y(d) {
  return d.y;
}
function z(d) {
  return d.z;
}
var initialRadius = 10;
var initialAngleRoll = Math.PI * (3 - Math.sqrt(5));
var initialAngleYaw = Math.PI * 20 / (9 + Math.sqrt(221));
function simulation_default(nodes, numDimensions) {
  numDimensions = numDimensions || 2;
  var nDim = Math.min(MAX_DIMENSIONS, Math.max(1, Math.round(numDimensions))), simulation, alpha = 1, alphaMin = 1e-3, alphaDecay = 1 - Math.pow(alphaMin, 1 / 300), alphaTarget = 0, velocityDecay = 0.6, forces = /* @__PURE__ */ new Map(), stepper = timer(step), event = dispatch("tick", "end"), random = lcg_default();
  if (nodes == null) nodes = [];
  function step() {
    tick();
    event.call("tick", simulation);
    if (alpha < alphaMin) {
      stepper.stop();
      event.call("end", simulation);
    }
  }
  function tick(iterations) {
    var i, n = nodes.length, node;
    if (iterations === void 0) iterations = 1;
    for (var k = 0; k < iterations; ++k) {
      alpha += (alphaTarget - alpha) * alphaDecay;
      forces.forEach(function(force) {
        force(alpha);
      });
      for (i = 0; i < n; ++i) {
        node = nodes[i];
        if (node.fx == null) node.x += node.vx *= velocityDecay;
        else node.x = node.fx, node.vx = 0;
        if (nDim > 1) {
          if (node.fy == null) node.y += node.vy *= velocityDecay;
          else node.y = node.fy, node.vy = 0;
        }
        if (nDim > 2) {
          if (node.fz == null) node.z += node.vz *= velocityDecay;
          else node.z = node.fz, node.vz = 0;
        }
      }
    }
    return simulation;
  }
  function initializeNodes() {
    for (var i = 0, n = nodes.length, node; i < n; ++i) {
      node = nodes[i], node.index = i;
      if (node.fx != null) node.x = node.fx;
      if (node.fy != null) node.y = node.fy;
      if (node.fz != null) node.z = node.fz;
      if (isNaN(node.x) || nDim > 1 && isNaN(node.y) || nDim > 2 && isNaN(node.z)) {
        var radius = initialRadius * (nDim > 2 ? Math.cbrt(0.5 + i) : nDim > 1 ? Math.sqrt(0.5 + i) : i), rollAngle = i * initialAngleRoll, yawAngle = i * initialAngleYaw;
        if (nDim === 1) {
          node.x = radius;
        } else if (nDim === 2) {
          node.x = radius * Math.cos(rollAngle);
          node.y = radius * Math.sin(rollAngle);
        } else {
          node.x = radius * Math.sin(rollAngle) * Math.cos(yawAngle);
          node.y = radius * Math.cos(rollAngle);
          node.z = radius * Math.sin(rollAngle) * Math.sin(yawAngle);
        }
      }
      if (isNaN(node.vx) || nDim > 1 && isNaN(node.vy) || nDim > 2 && isNaN(node.vz)) {
        node.vx = 0;
        if (nDim > 1) {
          node.vy = 0;
        }
        if (nDim > 2) {
          node.vz = 0;
        }
      }
    }
  }
  function initializeForce(force) {
    if (force.initialize) force.initialize(nodes, random, nDim);
    return force;
  }
  initializeNodes();
  return simulation = {
    tick,
    restart: function() {
      return stepper.restart(step), simulation;
    },
    stop: function() {
      return stepper.stop(), simulation;
    },
    numDimensions: function(_) {
      return arguments.length ? (nDim = Math.min(MAX_DIMENSIONS, Math.max(1, Math.round(_))), forces.forEach(initializeForce), simulation) : nDim;
    },
    nodes: function(_) {
      return arguments.length ? (nodes = _, initializeNodes(), forces.forEach(initializeForce), simulation) : nodes;
    },
    alpha: function(_) {
      return arguments.length ? (alpha = +_, simulation) : alpha;
    },
    alphaMin: function(_) {
      return arguments.length ? (alphaMin = +_, simulation) : alphaMin;
    },
    alphaDecay: function(_) {
      return arguments.length ? (alphaDecay = +_, simulation) : +alphaDecay;
    },
    alphaTarget: function(_) {
      return arguments.length ? (alphaTarget = +_, simulation) : alphaTarget;
    },
    velocityDecay: function(_) {
      return arguments.length ? (velocityDecay = 1 - _, simulation) : 1 - velocityDecay;
    },
    randomSource: function(_) {
      return arguments.length ? (random = _, forces.forEach(initializeForce), simulation) : random;
    },
    force: function(name, _) {
      return arguments.length > 1 ? (_ == null ? forces.delete(name) : forces.set(name, initializeForce(_)), simulation) : forces.get(name);
    },
    find: function() {
      var args = Array.prototype.slice.call(arguments);
      var x2 = args.shift() || 0, y2 = (nDim > 1 ? args.shift() : null) || 0, z2 = (nDim > 2 ? args.shift() : null) || 0, radius = args.shift() || Infinity;
      var i = 0, n = nodes.length, dx, dy, dz, d2, node, closest;
      radius *= radius;
      for (i = 0; i < n; ++i) {
        node = nodes[i];
        dx = x2 - node.x;
        dy = y2 - (node.y || 0);
        dz = z2 - (node.z || 0);
        d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < radius) closest = node, radius = d2;
      }
      return closest;
    },
    on: function(name, _) {
      return arguments.length > 1 ? (event.on(name, _), simulation) : event.on(name);
    }
  };
}

// node_modules/d3-force-3d/src/manyBody.js
function manyBody_default() {
  var nodes, nDim, node, random, alpha, strength = constant_default(-30), strengths, distanceMin2 = 1, distanceMax2 = Infinity, theta2 = 0.81;
  function force(_) {
    var i, n = nodes.length, tree = (nDim === 1 ? binarytree(nodes, x) : nDim === 2 ? quadtree(nodes, x, y) : nDim === 3 ? octree(nodes, x, y, z) : null).visitAfter(accumulate);
    for (alpha = _, i = 0; i < n; ++i) node = nodes[i], tree.visit(apply);
  }
  function initialize() {
    if (!nodes) return;
    var i, n = nodes.length, node2;
    strengths = new Array(n);
    for (i = 0; i < n; ++i) node2 = nodes[i], strengths[node2.index] = +strength(node2, i, nodes);
  }
  function accumulate(treeNode) {
    var strength2 = 0, q, c3, weight = 0, x2, y2, z2, i;
    var numChildren = treeNode.length;
    if (numChildren) {
      for (x2 = y2 = z2 = i = 0; i < numChildren; ++i) {
        if ((q = treeNode[i]) && (c3 = Math.abs(q.value))) {
          strength2 += q.value, weight += c3, x2 += c3 * (q.x || 0), y2 += c3 * (q.y || 0), z2 += c3 * (q.z || 0);
        }
      }
      strength2 *= Math.sqrt(4 / numChildren);
      treeNode.x = x2 / weight;
      if (nDim > 1) {
        treeNode.y = y2 / weight;
      }
      if (nDim > 2) {
        treeNode.z = z2 / weight;
      }
    } else {
      q = treeNode;
      q.x = q.data.x;
      if (nDim > 1) {
        q.y = q.data.y;
      }
      if (nDim > 2) {
        q.z = q.data.z;
      }
      do
        strength2 += strengths[q.data.index];
      while (q = q.next);
    }
    treeNode.value = strength2;
  }
  function apply(treeNode, x1, arg1, arg2, arg3) {
    if (!treeNode.value) return true;
    var x2 = [arg1, arg2, arg3][nDim - 1];
    var x3 = treeNode.x - node.x, y2 = nDim > 1 ? treeNode.y - node.y : 0, z2 = nDim > 2 ? treeNode.z - node.z : 0, w = x2 - x1, l = x3 * x3 + y2 * y2 + z2 * z2;
    if (w * w / theta2 < l) {
      if (l < distanceMax2) {
        if (x3 === 0) x3 = jiggle_default(random), l += x3 * x3;
        if (nDim > 1 && y2 === 0) y2 = jiggle_default(random), l += y2 * y2;
        if (nDim > 2 && z2 === 0) z2 = jiggle_default(random), l += z2 * z2;
        if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l);
        node.vx += x3 * treeNode.value * alpha / l;
        if (nDim > 1) {
          node.vy += y2 * treeNode.value * alpha / l;
        }
        if (nDim > 2) {
          node.vz += z2 * treeNode.value * alpha / l;
        }
      }
      return true;
    } else if (treeNode.length || l >= distanceMax2) return;
    if (treeNode.data !== node || treeNode.next) {
      if (x3 === 0) x3 = jiggle_default(random), l += x3 * x3;
      if (nDim > 1 && y2 === 0) y2 = jiggle_default(random), l += y2 * y2;
      if (nDim > 2 && z2 === 0) z2 = jiggle_default(random), l += z2 * z2;
      if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l);
    }
    do
      if (treeNode.data !== node) {
        w = strengths[treeNode.data.index] * alpha / l;
        node.vx += x3 * w;
        if (nDim > 1) {
          node.vy += y2 * w;
        }
        if (nDim > 2) {
          node.vz += z2 * w;
        }
      }
    while (treeNode = treeNode.next);
  }
  force.initialize = function(_nodes, ...args) {
    nodes = _nodes;
    random = args.find((arg) => typeof arg === "function") || Math.random;
    nDim = args.find((arg) => [1, 2, 3].includes(arg)) || 2;
    initialize();
  };
  force.strength = function(_) {
    return arguments.length ? (strength = typeof _ === "function" ? _ : constant_default(+_), initialize(), force) : strength;
  };
  force.distanceMin = function(_) {
    return arguments.length ? (distanceMin2 = _ * _, force) : Math.sqrt(distanceMin2);
  };
  force.distanceMax = function(_) {
    return arguments.length ? (distanceMax2 = _ * _, force) : Math.sqrt(distanceMax2);
  };
  force.theta = function(_) {
    return arguments.length ? (theta2 = _ * _, force) : Math.sqrt(theta2);
  };
  return force;
}

// node_modules/d3-force-3d/src/radial.js
function radial_default(radius, x2, y2, z2) {
  var nodes, nDim, strength = constant_default(0.1), strengths, radiuses;
  if (typeof radius !== "function") radius = constant_default(+radius);
  if (x2 == null) x2 = 0;
  if (y2 == null) y2 = 0;
  if (z2 == null) z2 = 0;
  function force(alpha) {
    for (var i = 0, n = nodes.length; i < n; ++i) {
      var node = nodes[i], dx = node.x - x2 || 1e-6, dy = (node.y || 0) - y2 || 1e-6, dz = (node.z || 0) - z2 || 1e-6, r = Math.sqrt(dx * dx + dy * dy + dz * dz), k = (radiuses[i] - r) * strengths[i] * alpha / r;
      node.vx += dx * k;
      if (nDim > 1) {
        node.vy += dy * k;
      }
      if (nDim > 2) {
        node.vz += dz * k;
      }
    }
  }
  function initialize() {
    if (!nodes) return;
    var i, n = nodes.length;
    strengths = new Array(n);
    radiuses = new Array(n);
    for (i = 0; i < n; ++i) {
      radiuses[i] = +radius(nodes[i], i, nodes);
      strengths[i] = isNaN(radiuses[i]) ? 0 : +strength(nodes[i], i, nodes);
    }
  }
  force.initialize = function(initNodes, ...args) {
    nodes = initNodes;
    nDim = args.find((arg) => [1, 2, 3].includes(arg)) || 2;
    initialize();
  };
  force.strength = function(_) {
    return arguments.length ? (strength = typeof _ === "function" ? _ : constant_default(+_), initialize(), force) : strength;
  };
  force.radius = function(_) {
    return arguments.length ? (radius = typeof _ === "function" ? _ : constant_default(+_), initialize(), force) : radius;
  };
  force.x = function(_) {
    return arguments.length ? (x2 = +_, force) : x2;
  };
  force.y = function(_) {
    return arguments.length ? (y2 = +_, force) : y2;
  };
  force.z = function(_) {
    return arguments.length ? (z2 = +_, force) : z2;
  };
  return force;
}

// node_modules/ngraph.events/index.js
function eventify(subject) {
  validateSubject(subject);
  const eventsStorage = createEventsStorage(subject);
  subject.on = eventsStorage.on;
  subject.off = eventsStorage.off;
  subject.fire = eventsStorage.fire;
  return subject;
}
function createEventsStorage(subject) {
  let registeredEvents = /* @__PURE__ */ Object.create(null);
  return {
    on: function(eventName, callback, ctx) {
      if (typeof callback !== "function") {
        throw new Error("callback is expected to be a function");
      }
      let handlers = registeredEvents[eventName];
      if (!handlers) {
        handlers = registeredEvents[eventName] = [];
      }
      handlers.push({ callback, ctx });
      return subject;
    },
    off: function(eventName, callback) {
      const wantToRemoveAll = typeof eventName === "undefined";
      if (wantToRemoveAll) {
        registeredEvents = /* @__PURE__ */ Object.create(null);
        return subject;
      }
      if (registeredEvents[eventName]) {
        const deleteAllCallbacksForEvent = typeof callback !== "function";
        if (deleteAllCallbacksForEvent) {
          delete registeredEvents[eventName];
        } else {
          const callbacks = registeredEvents[eventName];
          for (let i = 0; i < callbacks.length; ++i) {
            if (callbacks[i].callback === callback) {
              callbacks.splice(i, 1);
            }
          }
        }
      }
      return subject;
    },
    fire: function(eventName) {
      const callbacks = registeredEvents[eventName];
      if (!callbacks) {
        return subject;
      }
      let fireArguments;
      if (arguments.length > 1) {
        fireArguments = Array.prototype.slice.call(arguments, 1);
      }
      for (let i = 0; i < callbacks.length; ++i) {
        const callbackInfo = callbacks[i];
        callbackInfo.callback.apply(callbackInfo.ctx, fireArguments);
      }
      return subject;
    }
  };
}
function validateSubject(subject) {
  if (!subject) {
    throw new Error("Eventify cannot use falsy object as events subject");
  }
  const reservedWords = ["on", "fire", "off"];
  for (let i = 0; i < reservedWords.length; ++i) {
    if (subject.hasOwnProperty(reservedWords[i])) {
      throw new Error("Subject cannot be eventified, since it already has property '" + reservedWords[i] + "'");
    }
  }
}

// node_modules/ngraph.graph/index.js
var ngraph_default = createGraph;
function createGraph(options) {
  options = options || {};
  if ("uniqueLinkId" in options) {
    console.warn(
      "ngraph.graph: Starting from version 0.14 `uniqueLinkId` is deprecated.\nUse `multigraph` option instead\n",
      "\n",
      "Note: there is also change in default behavior: From now on each graph\nis considered to be not a multigraph by default (each edge is unique)."
    );
    options.multigraph = options.uniqueLinkId;
  }
  if (options.multigraph === void 0) options.multigraph = false;
  if (typeof Map !== "function") {
    throw new Error("ngraph.graph requires `Map` to be defined. Please polyfill it before using ngraph");
  }
  var nodes = /* @__PURE__ */ new Map();
  var links = /* @__PURE__ */ new Map();
  var multiEdges = {};
  var suspendEvents = 0;
  var createLink = options.multigraph ? createUniqueLink : createSingleLink, changes = [], recordLinkChange = noop2, recordNodeChange = noop2, enterModification = noop2, exitModification = noop2;
  var graphPart = {
    /**
     * Sometimes duck typing could be slow. Giving clients a hint about data structure
     * via explicit version number here:
     */
    version: 20,
    /**
     * Adds node to the graph. If node with given id already exists in the graph
     * its data is extended with whatever comes in 'data' argument.
     *
     * @param nodeId the node's identifier. A string or number is preferred.
     * @param [data] additional data for the node being added. If node already
     *   exists its data object is augmented with the new one.
     *
     * @return {node} The newly added node or node with given id if it already exists.
     */
    addNode,
    /**
     * Adds a link to the graph. The function always create a new
     * link between two nodes. If one of the nodes does not exists
     * a new node is created.
     *
     * @param fromId link start node id;
     * @param toId link end node id;
     * @param [data] additional data to be set on the new link;
     *
     * @return {link} The newly created link
     */
    addLink,
    /**
     * Removes link from the graph. If link does not exist does nothing.
     *
     * @param link - object returned by addLink() or getLinks() methods.
     *
     * @returns true if link was removed; false otherwise.
     */
    removeLink,
    /**
     * Removes node with given id from the graph. If node does not exist in the graph
     * does nothing.
     *
     * @param nodeId node's identifier passed to addNode() function.
     *
     * @returns true if node was removed; false otherwise.
     */
    removeNode,
    /**
     * Gets node with given identifier. If node does not exist undefined value is returned.
     *
     * @param nodeId requested node identifier;
     *
     * @return {node} in with requested identifier or undefined if no such node exists.
     */
    getNode,
    /**
     * Gets number of nodes in this graph.
     *
     * @return number of nodes in the graph.
     */
    getNodeCount,
    /**
     * Gets total number of links in the graph.
     */
    getLinkCount,
    /**
     * Synonym for `getLinkCount()`
     */
    getEdgeCount: getLinkCount,
    /**
     * Synonym for `getLinkCount()`
     */
    getLinksCount: getLinkCount,
    /**
     * Synonym for `getNodeCount()`
     */
    getNodesCount: getNodeCount,
    /**
     * Gets all links (inbound and outbound) from the node with given id.
     * If node with given id is not found null is returned.
     *
     * @param nodeId requested node identifier.
     *
     * @return Set of links from and to requested node if such node exists;
     *   otherwise null is returned.
     */
    getLinks,
    /**
     * Invokes callback on each node of the graph.
     *
     * @param {Function(node)} callback Function to be invoked. The function
     *   is passed one argument: visited node.
     */
    forEachNode,
    /**
     * Invokes callback on every linked (adjacent) node to the given one.
     *
     * @param nodeId Identifier of the requested node.
     * @param {Function(node, link)} callback Function to be called on all linked nodes.
     *   The function is passed two parameters: adjacent node and link object itself.
     * @param oriented if true graph treated as oriented.
     */
    forEachLinkedNode,
    /**
     * Enumerates all links in the graph
     *
     * @param {Function(link)} callback Function to be called on all links in the graph.
     *   The function is passed one parameter: graph's link object.
     *
     * Link object contains at least the following fields:
     *  fromId - node id where link starts;
     *  toId - node id where link ends,
     *  data - additional data passed to graph.addLink() method.
     */
    forEachLink,
    /**
     * Suspend all notifications about graph changes until
     * endUpdate is called.
     */
    beginUpdate: enterModification,
    /**
     * Resumes all notifications about graph changes and fires
     * graph 'changed' event in case there are any pending changes.
     */
    endUpdate: exitModification,
    /**
     * Removes all nodes and links from the graph.
     */
    clear,
    /**
     * Detects whether there is a link between two nodes.
     * Operation complexity is O(n) where n - number of links of a node.
     * NOTE: this function is synonym for getLink()
     *
     * @returns link if there is one. null otherwise.
     */
    hasLink: getLink,
    /**
     * Detects whether there is a node with given id
     * 
     * Operation complexity is O(1)
     * NOTE: this function is synonym for getNode()
     *
     * @returns node if there is one; Falsy value otherwise.
     */
    hasNode: getNode,
    /**
     * Gets an edge between two nodes.
     * Operation complexity is O(n) where n - number of links of a node.
     *
     * @param {string} fromId link start identifier
     * @param {string} toId link end identifier
     *
     * @returns link if there is one; undefined otherwise.
     */
    getLink,
    /**
     * Gets a link by its id.
     *
     * @param {string} linkId link identifier
     *
     * @returns link if there is one; undefined otherwise.
     */
    getLinkById
  };
  eventify(graphPart);
  monitorSubscribers();
  return graphPart;
  function monitorSubscribers() {
    var realOn = graphPart.on;
    graphPart.on = on;
    function on() {
      graphPart.beginUpdate = enterModification = enterModificationReal;
      graphPart.endUpdate = exitModification = exitModificationReal;
      recordLinkChange = recordLinkChangeReal;
      recordNodeChange = recordNodeChangeReal;
      graphPart.on = realOn;
      return realOn.apply(graphPart, arguments);
    }
  }
  function recordLinkChangeReal(link, changeType) {
    changes.push({
      link,
      changeType
    });
  }
  function recordNodeChangeReal(node, changeType) {
    changes.push({
      node,
      changeType
    });
  }
  function addNode(nodeId, data) {
    if (nodeId === void 0) {
      throw new Error("Invalid node identifier");
    }
    enterModification();
    var node = getNode(nodeId);
    if (!node) {
      node = new Node(nodeId, data);
      recordNodeChange(node, "add");
    } else {
      node.data = data;
      recordNodeChange(node, "update");
    }
    nodes.set(nodeId, node);
    exitModification();
    return node;
  }
  function getNode(nodeId) {
    return nodes.get(nodeId);
  }
  function removeNode(nodeId) {
    var node = getNode(nodeId);
    if (!node) {
      return false;
    }
    enterModification();
    var prevLinks = node.links;
    if (prevLinks) {
      prevLinks.forEach(removeLinkInstance);
      node.links = null;
    }
    nodes.delete(nodeId);
    recordNodeChange(node, "remove");
    exitModification();
    return true;
  }
  function addLink(fromId, toId, data) {
    enterModification();
    var fromNode = getNode(fromId) || addNode(fromId);
    var toNode = getNode(toId) || addNode(toId);
    var link = createLink(fromId, toId, data);
    var isUpdate = links.has(link.id);
    links.set(link.id, link);
    addLinkToNode(fromNode, link);
    if (fromId !== toId) {
      addLinkToNode(toNode, link);
    }
    recordLinkChange(link, isUpdate ? "update" : "add");
    exitModification();
    return link;
  }
  function createSingleLink(fromId, toId, data) {
    var linkId = makeLinkId(fromId, toId);
    var prevLink = links.get(linkId);
    if (prevLink) {
      prevLink.data = data;
      return prevLink;
    }
    return new Link(fromId, toId, data, linkId);
  }
  function createUniqueLink(fromId, toId, data) {
    var linkId = makeLinkId(fromId, toId);
    var isMultiEdge = multiEdges.hasOwnProperty(linkId);
    if (isMultiEdge || getLink(fromId, toId)) {
      if (!isMultiEdge) {
        multiEdges[linkId] = 0;
      }
      var suffix = "@" + ++multiEdges[linkId];
      linkId = makeLinkId(fromId + suffix, toId + suffix);
    }
    return new Link(fromId, toId, data, linkId);
  }
  function getNodeCount() {
    return nodes.size;
  }
  function getLinkCount() {
    return links.size;
  }
  function getLinks(nodeId) {
    var node = getNode(nodeId);
    return node ? node.links : null;
  }
  function removeLink(link, otherId) {
    if (otherId !== void 0) {
      link = getLink(link, otherId);
    }
    return removeLinkInstance(link);
  }
  function removeLinkInstance(link) {
    if (!link) {
      return false;
    }
    if (!links.get(link.id)) return false;
    enterModification();
    links.delete(link.id);
    var fromNode = getNode(link.fromId);
    var toNode = getNode(link.toId);
    if (fromNode) {
      fromNode.links.delete(link);
    }
    if (toNode) {
      toNode.links.delete(link);
    }
    recordLinkChange(link, "remove");
    exitModification();
    return true;
  }
  function getLink(fromNodeId, toNodeId) {
    if (fromNodeId === void 0 || toNodeId === void 0) return void 0;
    return links.get(makeLinkId(fromNodeId, toNodeId));
  }
  function getLinkById(linkId) {
    if (linkId === void 0) return void 0;
    return links.get(linkId);
  }
  function clear() {
    enterModification();
    forEachNode(function(node) {
      removeNode(node.id);
    });
    exitModification();
  }
  function forEachLink(callback) {
    if (typeof callback === "function") {
      var valuesIterator = links.values();
      var nextValue = valuesIterator.next();
      while (!nextValue.done) {
        if (callback(nextValue.value)) {
          return true;
        }
        nextValue = valuesIterator.next();
      }
    }
  }
  function forEachLinkedNode(nodeId, callback, oriented) {
    var node = getNode(nodeId);
    if (node && node.links && typeof callback === "function") {
      if (oriented) {
        return forEachOrientedLink(node.links, nodeId, callback);
      } else {
        return forEachNonOrientedLink(node.links, nodeId, callback);
      }
    }
  }
  function forEachNonOrientedLink(links2, nodeId, callback) {
    var quitFast;
    var valuesIterator = links2.values();
    var nextValue = valuesIterator.next();
    while (!nextValue.done) {
      var link = nextValue.value;
      var linkedNodeId = link.fromId === nodeId ? link.toId : link.fromId;
      quitFast = callback(nodes.get(linkedNodeId), link);
      if (quitFast) {
        return true;
      }
      nextValue = valuesIterator.next();
    }
  }
  function forEachOrientedLink(links2, nodeId, callback) {
    var quitFast;
    var valuesIterator = links2.values();
    var nextValue = valuesIterator.next();
    while (!nextValue.done) {
      var link = nextValue.value;
      if (link.fromId === nodeId) {
        quitFast = callback(nodes.get(link.toId), link);
        if (quitFast) {
          return true;
        }
      }
      nextValue = valuesIterator.next();
    }
  }
  function noop2() {
  }
  function enterModificationReal() {
    suspendEvents += 1;
  }
  function exitModificationReal() {
    suspendEvents -= 1;
    if (suspendEvents === 0 && changes.length > 0) {
      graphPart.fire("changed", changes);
      changes.length = 0;
    }
  }
  function forEachNode(callback) {
    if (typeof callback !== "function") {
      throw new Error("Function is expected to iterate over graph nodes. You passed " + callback);
    }
    var valuesIterator = nodes.values();
    var nextValue = valuesIterator.next();
    while (!nextValue.done) {
      if (callback(nextValue.value)) {
        return true;
      }
      nextValue = valuesIterator.next();
    }
  }
}
function Node(id, data) {
  this.id = id;
  this.links = null;
  this.data = data;
}
function addLinkToNode(node, link) {
  if (node.links) {
    node.links.add(link);
  } else {
    node.links = /* @__PURE__ */ new Set([link]);
  }
}
function Link(fromId, toId, data, id) {
  this.fromId = fromId;
  this.toId = toId;
  this.data = data;
  this.id = id;
}
function makeLinkId(fromId, toId) {
  return fromId.toString() + "\u{1F449} " + toId.toString();
}

// node_modules/three-forcegraph/dist/three-forcegraph.mjs
var import_ngraph3 = __toESM(require_ngraph3(), 1);

// node_modules/lodash-es/isObject.js
function isObject(value) {
  var type = typeof value;
  return value != null && (type == "object" || type == "function");
}
var isObject_default = isObject;

// node_modules/lodash-es/_freeGlobal.js
var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
var freeGlobal_default = freeGlobal;

// node_modules/lodash-es/_root.js
var freeSelf = typeof self == "object" && self && self.Object === Object && self;
var root = freeGlobal_default || freeSelf || Function("return this")();
var root_default3 = root;

// node_modules/lodash-es/now.js
var now2 = function() {
  return root_default3.Date.now();
};
var now_default = now2;

// node_modules/lodash-es/_trimmedEndIndex.js
var reWhitespace = /\s/;
function trimmedEndIndex(string) {
  var index4 = string.length;
  while (index4-- && reWhitespace.test(string.charAt(index4))) {
  }
  return index4;
}
var trimmedEndIndex_default = trimmedEndIndex;

// node_modules/lodash-es/_baseTrim.js
var reTrimStart = /^\s+/;
function baseTrim(string) {
  return string ? string.slice(0, trimmedEndIndex_default(string) + 1).replace(reTrimStart, "") : string;
}
var baseTrim_default = baseTrim;

// node_modules/lodash-es/_Symbol.js
var Symbol2 = root_default3.Symbol;
var Symbol_default = Symbol2;

// node_modules/lodash-es/_getRawTag.js
var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
var nativeObjectToString = objectProto.toString;
var symToStringTag = Symbol_default ? Symbol_default.toStringTag : void 0;
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
  try {
    value[symToStringTag] = void 0;
    var unmasked = true;
  } catch (e) {
  }
  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}
var getRawTag_default = getRawTag;

// node_modules/lodash-es/_objectToString.js
var objectProto2 = Object.prototype;
var nativeObjectToString2 = objectProto2.toString;
function objectToString(value) {
  return nativeObjectToString2.call(value);
}
var objectToString_default = objectToString;

// node_modules/lodash-es/_baseGetTag.js
var nullTag = "[object Null]";
var undefinedTag = "[object Undefined]";
var symToStringTag2 = Symbol_default ? Symbol_default.toStringTag : void 0;
function baseGetTag(value) {
  if (value == null) {
    return value === void 0 ? undefinedTag : nullTag;
  }
  return symToStringTag2 && symToStringTag2 in Object(value) ? getRawTag_default(value) : objectToString_default(value);
}
var baseGetTag_default = baseGetTag;

// node_modules/lodash-es/isObjectLike.js
function isObjectLike(value) {
  return value != null && typeof value == "object";
}
var isObjectLike_default = isObjectLike;

// node_modules/lodash-es/isSymbol.js
var symbolTag = "[object Symbol]";
function isSymbol(value) {
  return typeof value == "symbol" || isObjectLike_default(value) && baseGetTag_default(value) == symbolTag;
}
var isSymbol_default = isSymbol;

// node_modules/lodash-es/toNumber.js
var NAN = 0 / 0;
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
var reIsBinary = /^0b[01]+$/i;
var reIsOctal = /^0o[0-7]+$/i;
var freeParseInt = parseInt;
function toNumber(value) {
  if (typeof value == "number") {
    return value;
  }
  if (isSymbol_default(value)) {
    return NAN;
  }
  if (isObject_default(value)) {
    var other = typeof value.valueOf == "function" ? value.valueOf() : value;
    value = isObject_default(other) ? other + "" : other;
  }
  if (typeof value != "string") {
    return value === 0 ? value : +value;
  }
  value = baseTrim_default(value);
  var isBinary = reIsBinary.test(value);
  return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
}
var toNumber_default = toNumber;

// node_modules/lodash-es/debounce.js
var FUNC_ERROR_TEXT = "Expected a function";
var nativeMax = Math.max;
var nativeMin = Math.min;
function debounce(func, wait, options) {
  var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
  if (typeof func != "function") {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber_default(wait) || 0;
  if (isObject_default(options)) {
    leading = !!options.leading;
    maxing = "maxWait" in options;
    maxWait = maxing ? nativeMax(toNumber_default(options.maxWait) || 0, wait) : maxWait;
    trailing = "trailing" in options ? !!options.trailing : trailing;
  }
  function invokeFunc(time) {
    var args = lastArgs, thisArg = lastThis;
    lastArgs = lastThis = void 0;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }
  function leadingEdge(time) {
    lastInvokeTime = time;
    timerId = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  }
  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, timeWaiting = wait - timeSinceLastCall;
    return maxing ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
  }
  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
    return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
  }
  function timerExpired() {
    var time = now_default();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timerId = setTimeout(timerExpired, remainingWait(time));
  }
  function trailingEdge(time) {
    timerId = void 0;
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = void 0;
    return result;
  }
  function cancel() {
    if (timerId !== void 0) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = void 0;
  }
  function flush() {
    return timerId === void 0 ? result : trailingEdge(now_default());
  }
  function debounced() {
    var time = now_default(), isInvoking = shouldInvoke(time);
    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;
    if (isInvoking) {
      if (timerId === void 0) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        clearTimeout(timerId);
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === void 0) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}
var debounce_default = debounce;

// node_modules/kapsule/dist/kapsule.mjs
function _arrayLikeToArray(r, a2) {
  (null == a2 || a2 > r.length) && (a2 = r.length);
  for (var e = 0, n = Array(a2); e < a2; e++) n[e] = r[e];
  return n;
}
function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}
function _classCallCheck(a2, n) {
  if (!(a2 instanceof n)) throw new TypeError("Cannot call a class as a function");
}
function _createClass(e, r, t) {
  return Object.defineProperty(e, "prototype", {
    writable: false
  }), e;
}
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e, n, i, u, a2 = [], f = true, o = false;
    try {
      if (i = (t = t.call(r)).next, 0 === l) ;
      else for (; !(f = (e = i.call(t)).done) && (a2.push(e.value), a2.length !== l); f = true) ;
    } catch (r2) {
      o = true, n = r2;
    } finally {
      try {
        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a2;
  }
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _unsupportedIterableToArray(r, a2) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a2);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a2) : void 0;
  }
}
var Prop = /* @__PURE__ */ _createClass(function Prop2(name, _ref) {
  var _ref$default = _ref["default"], defaultVal = _ref$default === void 0 ? null : _ref$default, _ref$triggerUpdate = _ref.triggerUpdate, triggerUpdate = _ref$triggerUpdate === void 0 ? true : _ref$triggerUpdate, _ref$onChange = _ref.onChange, onChange = _ref$onChange === void 0 ? function(newVal, state) {
  } : _ref$onChange;
  _classCallCheck(this, Prop2);
  this.name = name;
  this.defaultVal = defaultVal;
  this.triggerUpdate = triggerUpdate;
  this.onChange = onChange;
});
function index2(_ref2) {
  var _ref2$stateInit = _ref2.stateInit, stateInit = _ref2$stateInit === void 0 ? function() {
    return {};
  } : _ref2$stateInit, _ref2$props = _ref2.props, rawProps = _ref2$props === void 0 ? {} : _ref2$props, _ref2$methods = _ref2.methods, methods = _ref2$methods === void 0 ? {} : _ref2$methods, _ref2$aliases = _ref2.aliases, aliases = _ref2$aliases === void 0 ? {} : _ref2$aliases, _ref2$init = _ref2.init, initFn = _ref2$init === void 0 ? function() {
  } : _ref2$init, _ref2$update = _ref2.update, updateFn = _ref2$update === void 0 ? function() {
  } : _ref2$update;
  var props = Object.keys(rawProps).map(function(propName) {
    return new Prop(propName, rawProps[propName]);
  });
  return function KapsuleComp() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var classMode = !!(this instanceof KapsuleComp ? this.constructor : void 0);
    var nodeElement = classMode ? args.shift() : void 0;
    var _args$ = args[0], options = _args$ === void 0 ? {} : _args$;
    var state = Object.assign(
      {},
      stateInit instanceof Function ? stateInit(options) : stateInit,
      // Support plain objects for backwards compatibility
      {
        initialised: false
      }
    );
    var changedProps = {};
    function comp(nodeElement2) {
      initStatic(nodeElement2, options);
      digest();
      return comp;
    }
    var initStatic = function initStatic2(nodeElement2, options2) {
      initFn.call(comp, nodeElement2, state, options2);
      state.initialised = true;
    };
    var digest = debounce_default(function() {
      if (!state.initialised) {
        return;
      }
      updateFn.call(comp, state, changedProps);
      changedProps = {};
    }, 1);
    props.forEach(function(prop) {
      comp[prop.name] = getSetProp(prop);
      function getSetProp(_ref3) {
        var prop2 = _ref3.name, _ref3$triggerUpdate = _ref3.triggerUpdate, redigest = _ref3$triggerUpdate === void 0 ? false : _ref3$triggerUpdate, _ref3$onChange = _ref3.onChange, onChange = _ref3$onChange === void 0 ? function(newVal, state2) {
        } : _ref3$onChange, _ref3$defaultVal = _ref3.defaultVal, defaultVal = _ref3$defaultVal === void 0 ? null : _ref3$defaultVal;
        return function(_) {
          var curVal = state[prop2];
          if (!arguments.length) {
            return curVal;
          }
          var val = _ === void 0 ? defaultVal : _;
          state[prop2] = val;
          onChange.call(comp, val, state, curVal);
          !changedProps.hasOwnProperty(prop2) && (changedProps[prop2] = curVal);
          if (redigest) {
            digest();
          }
          return comp;
        };
      }
    });
    Object.keys(methods).forEach(function(methodName) {
      comp[methodName] = function() {
        var _methods$methodName;
        for (var _len2 = arguments.length, args2 = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args2[_key2] = arguments[_key2];
        }
        return (_methods$methodName = methods[methodName]).call.apply(_methods$methodName, [comp, state].concat(args2));
      };
    });
    Object.entries(aliases).forEach(function(_ref4) {
      var _ref5 = _slicedToArray(_ref4, 2), alias = _ref5[0], target = _ref5[1];
      return comp[alias] = comp[target];
    });
    comp.resetProps = function() {
      props.forEach(function(prop) {
        comp[prop.name](prop.defaultVal);
      });
      return comp;
    };
    comp.resetProps();
    state._rerender = digest;
    classMode && nodeElement && comp(nodeElement);
    return comp;
  };
}

// node_modules/accessor-fn/dist/accessor-fn.mjs
var index3 = (function(p) {
  return typeof p === "function" ? p : typeof p === "string" ? function(obj) {
    return obj[p];
  } : function(obj) {
    return p;
  };
});

// node_modules/d3-array/dist/d3-array.mjs
function ascending(a2, b) {
  return a2 == null || b == null ? NaN : a2 < b ? -1 : a2 > b ? 1 : a2 >= b ? 0 : NaN;
}
function descending(a2, b) {
  return a2 == null || b == null ? NaN : b < a2 ? -1 : b > a2 ? 1 : b >= a2 ? 0 : NaN;
}
function bisector(f) {
  let compare1, compare2, delta;
  if (f.length !== 2) {
    compare1 = ascending;
    compare2 = (d, x2) => ascending(f(d), x2);
    delta = (d, x2) => f(d) - x2;
  } else {
    compare1 = f === ascending || f === descending ? f : zero;
    compare2 = f;
    delta = f;
  }
  function left(a2, x2, lo = 0, hi = a2.length) {
    if (lo < hi) {
      if (compare1(x2, x2) !== 0) return hi;
      do {
        const mid = lo + hi >>> 1;
        if (compare2(a2[mid], x2) < 0) lo = mid + 1;
        else hi = mid;
      } while (lo < hi);
    }
    return lo;
  }
  function right(a2, x2, lo = 0, hi = a2.length) {
    if (lo < hi) {
      if (compare1(x2, x2) !== 0) return hi;
      do {
        const mid = lo + hi >>> 1;
        if (compare2(a2[mid], x2) <= 0) lo = mid + 1;
        else hi = mid;
      } while (lo < hi);
    }
    return lo;
  }
  function center(a2, x2, lo = 0, hi = a2.length) {
    const i = left(a2, x2, lo, hi - 1);
    return i > lo && delta(a2[i - 1], x2) > -delta(a2[i], x2) ? i - 1 : i;
  }
  return { left, center, right };
}
function zero() {
  return 0;
}
function number(x2) {
  return x2 === null ? NaN : +x2;
}
var ascendingBisect = bisector(ascending);
var bisectRight = ascendingBisect.right;
var bisectLeft = ascendingBisect.left;
var bisectCenter = bisector(number).center;
var blur2 = Blur2(blurf);
var blurImage = Blur2(blurfImage);
function Blur2(blur) {
  return function(data, rx, ry = rx) {
    if (!((rx = +rx) >= 0)) throw new RangeError("invalid rx");
    if (!((ry = +ry) >= 0)) throw new RangeError("invalid ry");
    let { data: values, width, height } = data;
    if (!((width = Math.floor(width)) >= 0)) throw new RangeError("invalid width");
    if (!((height = Math.floor(height !== void 0 ? height : values.length / width)) >= 0)) throw new RangeError("invalid height");
    if (!width || !height || !rx && !ry) return data;
    const blurx = rx && blur(rx);
    const blury = ry && blur(ry);
    const temp = values.slice();
    if (blurx && blury) {
      blurh(blurx, temp, values, width, height);
      blurh(blurx, values, temp, width, height);
      blurh(blurx, temp, values, width, height);
      blurv(blury, values, temp, width, height);
      blurv(blury, temp, values, width, height);
      blurv(blury, values, temp, width, height);
    } else if (blurx) {
      blurh(blurx, values, temp, width, height);
      blurh(blurx, temp, values, width, height);
      blurh(blurx, values, temp, width, height);
    } else if (blury) {
      blurv(blury, values, temp, width, height);
      blurv(blury, temp, values, width, height);
      blurv(blury, values, temp, width, height);
    }
    return data;
  };
}
function blurh(blur, T, S, w, h) {
  for (let y2 = 0, n = w * h; y2 < n; ) {
    blur(T, S, y2, y2 += w, 1);
  }
}
function blurv(blur, T, S, w, h) {
  for (let x2 = 0, n = w * h; x2 < w; ++x2) {
    blur(T, S, x2, x2 + n, w);
  }
}
function blurfImage(radius) {
  const blur = blurf(radius);
  return (T, S, start, stop, step) => {
    start <<= 2, stop <<= 2, step <<= 2;
    blur(T, S, start + 0, stop + 0, step);
    blur(T, S, start + 1, stop + 1, step);
    blur(T, S, start + 2, stop + 2, step);
    blur(T, S, start + 3, stop + 3, step);
  };
}
function blurf(radius) {
  const radius0 = Math.floor(radius);
  if (radius0 === radius) return bluri(radius);
  const t = radius - radius0;
  const w = 2 * radius + 1;
  return (T, S, start, stop, step) => {
    if (!((stop -= step) >= start)) return;
    let sum = radius0 * S[start];
    const s0 = step * radius0;
    const s1 = s0 + step;
    for (let i = start, j = start + s0; i < j; i += step) {
      sum += S[Math.min(stop, i)];
    }
    for (let i = start, j = stop; i <= j; i += step) {
      sum += S[Math.min(stop, i + s0)];
      T[i] = (sum + t * (S[Math.max(start, i - s1)] + S[Math.min(stop, i + s1)])) / w;
      sum -= S[Math.max(start, i - s0)];
    }
  };
}
function bluri(radius) {
  const w = 2 * radius + 1;
  return (T, S, start, stop, step) => {
    if (!((stop -= step) >= start)) return;
    let sum = radius * S[start];
    const s = step * radius;
    for (let i = start, j = start + s; i < j; i += step) {
      sum += S[Math.min(stop, i)];
    }
    for (let i = start, j = stop; i <= j; i += step) {
      sum += S[Math.min(stop, i + s)];
      T[i] = sum / w;
      sum -= S[Math.max(start, i - s)];
    }
  };
}
var InternMap = class extends Map {
  constructor(entries, key = keyof) {
    super();
    Object.defineProperties(this, { _intern: { value: /* @__PURE__ */ new Map() }, _key: { value: key } });
    if (entries != null) for (const [key2, value] of entries) this.set(key2, value);
  }
  get(key) {
    return super.get(intern_get(this, key));
  }
  has(key) {
    return super.has(intern_get(this, key));
  }
  set(key, value) {
    return super.set(intern_set(this, key), value);
  }
  delete(key) {
    return super.delete(intern_delete(this, key));
  }
};
function intern_get({ _intern, _key }, value) {
  const key = _key(value);
  return _intern.has(key) ? _intern.get(key) : value;
}
function intern_set({ _intern, _key }, value) {
  const key = _key(value);
  if (_intern.has(key)) return _intern.get(key);
  _intern.set(key, value);
  return value;
}
function intern_delete({ _intern, _key }, value) {
  const key = _key(value);
  if (_intern.has(key)) {
    value = _intern.get(key);
    _intern.delete(key);
  }
  return value;
}
function keyof(value) {
  return value !== null && typeof value === "object" ? value.valueOf() : value;
}
var array = Array.prototype;
var slice = array.slice;
var e10 = Math.sqrt(50);
var e5 = Math.sqrt(10);
var e2 = Math.sqrt(2);
function max(values, valueof) {
  let max2;
  if (valueof === void 0) {
    for (const value of values) {
      if (value != null && (max2 < value || max2 === void 0 && value >= value)) {
        max2 = value;
      }
    }
  } else {
    let index4 = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index4, values)) != null && (max2 < value || max2 === void 0 && value >= value)) {
        max2 = value;
      }
    }
  }
  return max2;
}
function min(values, valueof) {
  let min2;
  if (valueof === void 0) {
    for (const value of values) {
      if (value != null && (min2 > value || min2 === void 0 && value >= value)) {
        min2 = value;
      }
    }
  } else {
    let index4 = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index4, values)) != null && (min2 > value || min2 === void 0 && value >= value)) {
        min2 = value;
      }
    }
  }
  return min2;
}
var shuffle = shuffler(Math.random);
function shuffler(random) {
  return function shuffle2(array2, i0 = 0, i1 = array2.length) {
    let m2 = i1 - (i0 = +i0);
    while (m2) {
      const i = random() * m2-- | 0, t = array2[m2 + i0];
      array2[m2 + i0] = array2[i + i0];
      array2[i + i0] = t;
    }
    return array2;
  };
}

// node_modules/data-bind-mapper/dist/data-bind-mapper.mjs
function _arrayLikeToArray2(r, a2) {
  (null == a2 || a2 > r.length) && (a2 = r.length);
  for (var e = 0, n = Array(a2); e < a2; e++) n[e] = r[e];
  return n;
}
function _arrayWithHoles2(r) {
  if (Array.isArray(r)) return r;
}
function _arrayWithoutHoles(r) {
  if (Array.isArray(r)) return _arrayLikeToArray2(r);
}
function _assertClassBrand(e, t, n) {
  if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n;
  throw new TypeError("Private element is not present on this object");
}
function _checkPrivateRedeclaration(e, t) {
  if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object");
}
function _classCallCheck2(a2, n) {
  if (!(a2 instanceof n)) throw new TypeError("Cannot call a class as a function");
}
function _classPrivateFieldGet2(s, a2) {
  return s.get(_assertClassBrand(s, a2));
}
function _classPrivateFieldInitSpec(e, t, a2) {
  _checkPrivateRedeclaration(e, t), t.set(e, a2);
}
function _classPrivateFieldSet2(s, a2, r) {
  return s.set(_assertClassBrand(s, a2), r), r;
}
function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey(o.key), o);
  }
}
function _createClass2(e, r, t) {
  return r && _defineProperties(e.prototype, r), Object.defineProperty(e, "prototype", {
    writable: false
  }), e;
}
function _iterableToArray(r) {
  if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
}
function _iterableToArrayLimit2(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e, n, i, u, a2 = [], f = true, o = false;
    try {
      if (i = (t = t.call(r)).next, 0 === l) ;
      else for (; !(f = (e = i.call(t)).done) && (a2.push(e.value), a2.length !== l); f = true) ;
    } catch (r2) {
      o = true, n = r2;
    } finally {
      try {
        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a2;
  }
}
function _nonIterableRest2() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _slicedToArray2(r, e) {
  return _arrayWithHoles2(r) || _iterableToArrayLimit2(r, e) || _unsupportedIterableToArray2(r, e) || _nonIterableRest2();
}
function _toConsumableArray(r) {
  return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray2(r) || _nonIterableSpread();
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r);
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _unsupportedIterableToArray2(r, a2) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray2(r, a2);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray2(r, a2) : void 0;
  }
}
var _dataMap = /* @__PURE__ */ new WeakMap();
var _objMap = /* @__PURE__ */ new WeakMap();
var _id = /* @__PURE__ */ new WeakMap();
var _createObj = /* @__PURE__ */ new WeakMap();
var _updateObj = /* @__PURE__ */ new WeakMap();
var _removeObj = /* @__PURE__ */ new WeakMap();
var DataBindMapper = /* @__PURE__ */ (function() {
  function DataBindMapper2() {
    _classCallCheck2(this, DataBindMapper2);
    _classPrivateFieldInitSpec(this, _dataMap, /* @__PURE__ */ new Map());
    _classPrivateFieldInitSpec(this, _objMap, /* @__PURE__ */ new Map());
    _classPrivateFieldInitSpec(this, _id, function(d) {
      return d;
    });
    _classPrivateFieldInitSpec(this, _createObj, function() {
      return {};
    });
    _classPrivateFieldInitSpec(this, _updateObj, function() {
    });
    _classPrivateFieldInitSpec(this, _removeObj, function() {
    });
  }
  return _createClass2(DataBindMapper2, [{
    key: "getObj",
    value: function getObj(d) {
      return _classPrivateFieldGet2(_dataMap, this).get(_classPrivateFieldGet2(_id, this).call(this, d));
    }
  }, {
    key: "getData",
    value: function getData(o) {
      return _classPrivateFieldGet2(_objMap, this).get(o);
    }
  }, {
    key: "entries",
    value: function entries() {
      return _toConsumableArray(_classPrivateFieldGet2(_objMap, this).entries()).map(function(_ref) {
        var _ref2 = _slicedToArray2(_ref, 2), o = _ref2[0], d = _ref2[1];
        return [d, o];
      });
    }
  }, {
    key: "id",
    value: function id(p) {
      _classPrivateFieldSet2(_id, this, index3(p));
      return this;
    }
  }, {
    key: "onCreateObj",
    value: function onCreateObj(fn) {
      _classPrivateFieldSet2(_createObj, this, fn);
      return this;
    }
  }, {
    key: "onUpdateObj",
    value: function onUpdateObj(fn) {
      _classPrivateFieldSet2(_updateObj, this, fn);
      return this;
    }
  }, {
    key: "onRemoveObj",
    value: function onRemoveObj(fn) {
      _classPrivateFieldSet2(_removeObj, this, fn);
      return this;
    }
  }, {
    key: "digest",
    value: function digest(data) {
      var _this = this;
      data.filter(function(d) {
        return !_classPrivateFieldGet2(_dataMap, _this).has(_classPrivateFieldGet2(_id, _this).call(_this, d));
      }).forEach(function(d) {
        var obj = _classPrivateFieldGet2(_createObj, _this).call(_this, d);
        _classPrivateFieldGet2(_dataMap, _this).set(_classPrivateFieldGet2(_id, _this).call(_this, d), obj);
        _classPrivateFieldGet2(_objMap, _this).set(obj, d);
      });
      var dataIdsMap = new Map(data.map(function(d) {
        return [_classPrivateFieldGet2(_id, _this).call(_this, d), d];
      }));
      _classPrivateFieldGet2(_dataMap, this).forEach(function(o, dId) {
        if (!dataIdsMap.has(dId)) {
          _classPrivateFieldGet2(_removeObj, _this).call(_this, o, dId);
          _classPrivateFieldGet2(_dataMap, _this)["delete"](dId);
          _classPrivateFieldGet2(_objMap, _this)["delete"](o);
        } else {
          _classPrivateFieldGet2(_updateObj, _this).call(_this, o, dataIdsMap.get(dId));
        }
      });
      return this;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.digest([]);
      return this;
    }
  }]);
})();

// node_modules/d3-color/dist/d3-color.mjs
function define(constructor, factory, prototype) {
  constructor.prototype = factory.prototype = prototype;
  prototype.constructor = constructor;
}
function extend(parent, definition) {
  var prototype = Object.create(parent.prototype);
  for (var key in definition) prototype[key] = definition[key];
  return prototype;
}
function Color() {
}
var darker = 0.7;
var brighter = 1 / darker;
var reI = "\\s*([+-]?\\d+)\\s*";
var reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*";
var reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*";
var reHex = /^#([0-9a-f]{3,8})$/;
var reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`);
var reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`);
var reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`);
var reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`);
var reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`);
var reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);
var named = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
define(Color, color, {
  copy(channels) {
    return Object.assign(new this.constructor(), this, channels);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: color_formatHex,
  // Deprecated! Use color.formatHex.
  formatHex: color_formatHex,
  formatHex8: color_formatHex8,
  formatHsl: color_formatHsl,
  formatRgb: color_formatRgb,
  toString: color_formatRgb
});
function color_formatHex() {
  return this.rgb().formatHex();
}
function color_formatHex8() {
  return this.rgb().formatHex8();
}
function color_formatHsl() {
  return hslConvert(this).formatHsl();
}
function color_formatRgb() {
  return this.rgb().formatRgb();
}
function color(format) {
  var m2, l;
  format = (format + "").trim().toLowerCase();
  return (m2 = reHex.exec(format)) ? (l = m2[1].length, m2 = parseInt(m2[1], 16), l === 6 ? rgbn(m2) : l === 3 ? new Rgb(m2 >> 8 & 15 | m2 >> 4 & 240, m2 >> 4 & 15 | m2 & 240, (m2 & 15) << 4 | m2 & 15, 1) : l === 8 ? rgba(m2 >> 24 & 255, m2 >> 16 & 255, m2 >> 8 & 255, (m2 & 255) / 255) : l === 4 ? rgba(m2 >> 12 & 15 | m2 >> 8 & 240, m2 >> 8 & 15 | m2 >> 4 & 240, m2 >> 4 & 15 | m2 & 240, ((m2 & 15) << 4 | m2 & 15) / 255) : null) : (m2 = reRgbInteger.exec(format)) ? new Rgb(m2[1], m2[2], m2[3], 1) : (m2 = reRgbPercent.exec(format)) ? new Rgb(m2[1] * 255 / 100, m2[2] * 255 / 100, m2[3] * 255 / 100, 1) : (m2 = reRgbaInteger.exec(format)) ? rgba(m2[1], m2[2], m2[3], m2[4]) : (m2 = reRgbaPercent.exec(format)) ? rgba(m2[1] * 255 / 100, m2[2] * 255 / 100, m2[3] * 255 / 100, m2[4]) : (m2 = reHslPercent.exec(format)) ? hsla(m2[1], m2[2] / 100, m2[3] / 100, 1) : (m2 = reHslaPercent.exec(format)) ? hsla(m2[1], m2[2] / 100, m2[3] / 100, m2[4]) : named.hasOwnProperty(format) ? rgbn(named[format]) : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
}
function rgbn(n) {
  return new Rgb(n >> 16 & 255, n >> 8 & 255, n & 255, 1);
}
function rgba(r, g, b, a2) {
  if (a2 <= 0) r = g = b = NaN;
  return new Rgb(r, g, b, a2);
}
function rgbConvert(o) {
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Rgb();
  o = o.rgb();
  return new Rgb(o.r, o.g, o.b, o.opacity);
}
function rgb(r, g, b, opacity) {
  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
}
function Rgb(r, g, b, opacity) {
  this.r = +r;
  this.g = +g;
  this.b = +b;
  this.opacity = +opacity;
}
define(Rgb, rgb, extend(Color, {
  brighter(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  darker(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && (-0.5 <= this.g && this.g < 255.5) && (-0.5 <= this.b && this.b < 255.5) && (0 <= this.opacity && this.opacity <= 1);
  },
  hex: rgb_formatHex,
  // Deprecated! Use color.formatHex.
  formatHex: rgb_formatHex,
  formatHex8: rgb_formatHex8,
  formatRgb: rgb_formatRgb,
  toString: rgb_formatRgb
}));
function rgb_formatHex() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
}
function rgb_formatHex8() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function rgb_formatRgb() {
  const a2 = clampa(this.opacity);
  return `${a2 === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a2 === 1 ? ")" : `, ${a2})`}`;
}
function clampa(opacity) {
  return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
}
function clampi(value) {
  return Math.max(0, Math.min(255, Math.round(value) || 0));
}
function hex(value) {
  value = clampi(value);
  return (value < 16 ? "0" : "") + value.toString(16);
}
function hsla(h, s, l, a2) {
  if (a2 <= 0) h = s = l = NaN;
  else if (l <= 0 || l >= 1) h = s = NaN;
  else if (s <= 0) h = NaN;
  return new Hsl(h, s, l, a2);
}
function hslConvert(o) {
  if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Hsl();
  if (o instanceof Hsl) return o;
  o = o.rgb();
  var r = o.r / 255, g = o.g / 255, b = o.b / 255, min2 = Math.min(r, g, b), max2 = Math.max(r, g, b), h = NaN, s = max2 - min2, l = (max2 + min2) / 2;
  if (s) {
    if (r === max2) h = (g - b) / s + (g < b) * 6;
    else if (g === max2) h = (b - r) / s + 2;
    else h = (r - g) / s + 4;
    s /= l < 0.5 ? max2 + min2 : 2 - max2 - min2;
    h *= 60;
  } else {
    s = l > 0 && l < 1 ? 0 : h;
  }
  return new Hsl(h, s, l, o.opacity);
}
function hsl(h, s, l, opacity) {
  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
}
function Hsl(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}
define(Hsl, hsl, extend(Color, {
  brighter(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  darker(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  rgb() {
    var h = this.h % 360 + (this.h < 0) * 360, s = isNaN(h) || isNaN(this.s) ? 0 : this.s, l = this.l, m2 = l + (l < 0.5 ? l : 1 - l) * s, m1 = 2 * l - m2;
    return new Rgb(
      hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
      hsl2rgb(h, m1, m2),
      hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
      this.opacity
    );
  },
  clamp() {
    return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && (0 <= this.l && this.l <= 1) && (0 <= this.opacity && this.opacity <= 1);
  },
  formatHsl() {
    const a2 = clampa(this.opacity);
    return `${a2 === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a2 === 1 ? ")" : `, ${a2})`}`;
  }
}));
function clamph(value) {
  value = (value || 0) % 360;
  return value < 0 ? value + 360 : value;
}
function clampt(value) {
  return Math.max(0, Math.min(1, value || 0));
}
function hsl2rgb(h, m1, m2) {
  return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
}
var radians = Math.PI / 180;
var degrees = 180 / Math.PI;
var K = 18;
var Xn = 0.96422;
var Yn = 1;
var Zn = 0.82521;
var t0 = 4 / 29;
var t1 = 6 / 29;
var t2 = 3 * t1 * t1;
var t3 = t1 * t1 * t1;
function labConvert(o) {
  if (o instanceof Lab) return new Lab(o.l, o.a, o.b, o.opacity);
  if (o instanceof Hcl) return hcl2lab(o);
  if (!(o instanceof Rgb)) o = rgbConvert(o);
  var r = rgb2lrgb(o.r), g = rgb2lrgb(o.g), b = rgb2lrgb(o.b), y2 = xyz2lab((0.2225045 * r + 0.7168786 * g + 0.0606169 * b) / Yn), x2, z2;
  if (r === g && g === b) x2 = z2 = y2;
  else {
    x2 = xyz2lab((0.4360747 * r + 0.3850649 * g + 0.1430804 * b) / Xn);
    z2 = xyz2lab((0.0139322 * r + 0.0971045 * g + 0.7141733 * b) / Zn);
  }
  return new Lab(116 * y2 - 16, 500 * (x2 - y2), 200 * (y2 - z2), o.opacity);
}
function lab(l, a2, b, opacity) {
  return arguments.length === 1 ? labConvert(l) : new Lab(l, a2, b, opacity == null ? 1 : opacity);
}
function Lab(l, a2, b, opacity) {
  this.l = +l;
  this.a = +a2;
  this.b = +b;
  this.opacity = +opacity;
}
define(Lab, lab, extend(Color, {
  brighter(k) {
    return new Lab(this.l + K * (k == null ? 1 : k), this.a, this.b, this.opacity);
  },
  darker(k) {
    return new Lab(this.l - K * (k == null ? 1 : k), this.a, this.b, this.opacity);
  },
  rgb() {
    var y2 = (this.l + 16) / 116, x2 = isNaN(this.a) ? y2 : y2 + this.a / 500, z2 = isNaN(this.b) ? y2 : y2 - this.b / 200;
    x2 = Xn * lab2xyz(x2);
    y2 = Yn * lab2xyz(y2);
    z2 = Zn * lab2xyz(z2);
    return new Rgb(
      lrgb2rgb(3.1338561 * x2 - 1.6168667 * y2 - 0.4906146 * z2),
      lrgb2rgb(-0.9787684 * x2 + 1.9161415 * y2 + 0.033454 * z2),
      lrgb2rgb(0.0719453 * x2 - 0.2289914 * y2 + 1.4052427 * z2),
      this.opacity
    );
  }
}));
function xyz2lab(t) {
  return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
}
function lab2xyz(t) {
  return t > t1 ? t * t * t : t2 * (t - t0);
}
function lrgb2rgb(x2) {
  return 255 * (x2 <= 31308e-7 ? 12.92 * x2 : 1.055 * Math.pow(x2, 1 / 2.4) - 0.055);
}
function rgb2lrgb(x2) {
  return (x2 /= 255) <= 0.04045 ? x2 / 12.92 : Math.pow((x2 + 0.055) / 1.055, 2.4);
}
function hclConvert(o) {
  if (o instanceof Hcl) return new Hcl(o.h, o.c, o.l, o.opacity);
  if (!(o instanceof Lab)) o = labConvert(o);
  if (o.a === 0 && o.b === 0) return new Hcl(NaN, 0 < o.l && o.l < 100 ? 0 : NaN, o.l, o.opacity);
  var h = Math.atan2(o.b, o.a) * degrees;
  return new Hcl(h < 0 ? h + 360 : h, Math.sqrt(o.a * o.a + o.b * o.b), o.l, o.opacity);
}
function hcl(h, c3, l, opacity) {
  return arguments.length === 1 ? hclConvert(h) : new Hcl(h, c3, l, opacity == null ? 1 : opacity);
}
function Hcl(h, c3, l, opacity) {
  this.h = +h;
  this.c = +c3;
  this.l = +l;
  this.opacity = +opacity;
}
function hcl2lab(o) {
  if (isNaN(o.h)) return new Lab(o.l, 0, 0, o.opacity);
  var h = o.h * radians;
  return new Lab(o.l, Math.cos(h) * o.c, Math.sin(h) * o.c, o.opacity);
}
define(Hcl, hcl, extend(Color, {
  brighter(k) {
    return new Hcl(this.h, this.c, this.l + K * (k == null ? 1 : k), this.opacity);
  },
  darker(k) {
    return new Hcl(this.h, this.c, this.l - K * (k == null ? 1 : k), this.opacity);
  },
  rgb() {
    return hcl2lab(this).rgb();
  }
}));
var A = -0.14861;
var B = 1.78277;
var C = -0.29227;
var D = -0.90649;
var E = 1.97294;
var ED = E * D;
var EB = E * B;
var BC_DA = B * C - D * A;
function cubehelixConvert(o) {
  if (o instanceof Cubehelix) return new Cubehelix(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Rgb)) o = rgbConvert(o);
  var r = o.r / 255, g = o.g / 255, b = o.b / 255, l = (BC_DA * b + ED * r - EB * g) / (BC_DA + ED - EB), bl = b - l, k = (E * (g - l) - C * bl) / D, s = Math.sqrt(k * k + bl * bl) / (E * l * (1 - l)), h = s ? Math.atan2(k, bl) * degrees - 120 : NaN;
  return new Cubehelix(h < 0 ? h + 360 : h, s, l, o.opacity);
}
function cubehelix(h, s, l, opacity) {
  return arguments.length === 1 ? cubehelixConvert(h) : new Cubehelix(h, s, l, opacity == null ? 1 : opacity);
}
function Cubehelix(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}
define(Cubehelix, cubehelix, extend(Color, {
  brighter(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
  },
  darker(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
  },
  rgb() {
    var h = isNaN(this.h) ? 0 : (this.h + 120) * radians, l = +this.l, a2 = isNaN(this.s) ? 0 : this.s * l * (1 - l), cosh2 = Math.cos(h), sinh2 = Math.sin(h);
    return new Rgb(
      255 * (l + a2 * (A * cosh2 + B * sinh2)),
      255 * (l + a2 * (C * cosh2 + D * sinh2)),
      255 * (l + a2 * (E * cosh2)),
      this.opacity
    );
  }
}));

// node_modules/d3-interpolate/dist/d3-interpolate.mjs
function basis(t12, v0, v1, v2, v3) {
  var t22 = t12 * t12, t32 = t22 * t12;
  return ((1 - 3 * t12 + 3 * t22 - t32) * v0 + (4 - 6 * t22 + 3 * t32) * v1 + (1 + 3 * t12 + 3 * t22 - 3 * t32) * v2 + t32 * v3) / 6;
}
function basis$1(values) {
  var n = values.length - 1;
  return function(t) {
    var i = t <= 0 ? t = 0 : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n), v1 = values[i], v2 = values[i + 1], v0 = i > 0 ? values[i - 1] : 2 * v1 - v2, v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
    return basis((t - i / n) * n, v0, v1, v2, v3);
  };
}
function basisClosed(values) {
  var n = values.length;
  return function(t) {
    var i = Math.floor(((t %= 1) < 0 ? ++t : t) * n), v0 = values[(i + n - 1) % n], v1 = values[i % n], v2 = values[(i + 1) % n], v3 = values[(i + 2) % n];
    return basis((t - i / n) * n, v0, v1, v2, v3);
  };
}
var constant = (x2) => () => x2;
function linear(a2, d) {
  return function(t) {
    return a2 + t * d;
  };
}
function exponential(a2, b, y2) {
  return a2 = Math.pow(a2, y2), b = Math.pow(b, y2) - a2, y2 = 1 / y2, function(t) {
    return Math.pow(a2 + t * b, y2);
  };
}
function hue$1(a2, b) {
  var d = b - a2;
  return d ? linear(a2, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant(isNaN(a2) ? b : a2);
}
function gamma(y2) {
  return (y2 = +y2) === 1 ? nogamma : function(a2, b) {
    return b - a2 ? exponential(a2, b, y2) : constant(isNaN(a2) ? b : a2);
  };
}
function nogamma(a2, b) {
  var d = b - a2;
  return d ? linear(a2, d) : constant(isNaN(a2) ? b : a2);
}
var rgb2 = (function rgbGamma(y2) {
  var color2 = gamma(y2);
  function rgb3(start, end) {
    var r = color2((start = rgb(start)).r, (end = rgb(end)).r), g = color2(start.g, end.g), b = color2(start.b, end.b), opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.r = r(t);
      start.g = g(t);
      start.b = b(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }
  rgb3.gamma = rgbGamma;
  return rgb3;
})(1);
function rgbSpline(spline) {
  return function(colors2) {
    var n = colors2.length, r = new Array(n), g = new Array(n), b = new Array(n), i, color2;
    for (i = 0; i < n; ++i) {
      color2 = rgb(colors2[i]);
      r[i] = color2.r || 0;
      g[i] = color2.g || 0;
      b[i] = color2.b || 0;
    }
    r = spline(r);
    g = spline(g);
    b = spline(b);
    color2.opacity = 1;
    return function(t) {
      color2.r = r(t);
      color2.g = g(t);
      color2.b = b(t);
      return color2 + "";
    };
  };
}
var rgbBasis = rgbSpline(basis$1);
var rgbBasisClosed = rgbSpline(basisClosed);
function number2(a2, b) {
  return a2 = +a2, b = +b, function(t) {
    return a2 * (1 - t) + b * t;
  };
}
var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
var reB = new RegExp(reA.source, "g");
var degrees2 = 180 / Math.PI;
var identity = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function decompose(a2, b, c3, d, e, f) {
  var scaleX, scaleY, skewX;
  if (scaleX = Math.sqrt(a2 * a2 + b * b)) a2 /= scaleX, b /= scaleX;
  if (skewX = a2 * c3 + b * d) c3 -= a2 * skewX, d -= b * skewX;
  if (scaleY = Math.sqrt(c3 * c3 + d * d)) c3 /= scaleY, d /= scaleY, skewX /= scaleY;
  if (a2 * d < b * c3) a2 = -a2, b = -b, skewX = -skewX, scaleX = -scaleX;
  return {
    translateX: e,
    translateY: f,
    rotate: Math.atan2(b, a2) * degrees2,
    skewX: Math.atan(skewX) * degrees2,
    scaleX,
    scaleY
  };
}
var svgNode;
function parseCss(value) {
  const m2 = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
  return m2.isIdentity ? identity : decompose(m2.a, m2.b, m2.c, m2.d, m2.e, m2.f);
}
function parseSvg(value) {
  if (value == null) return identity;
  if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svgNode.setAttribute("transform", value);
  if (!(value = svgNode.transform.baseVal.consolidate())) return identity;
  value = value.matrix;
  return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
}
function interpolateTransform(parse, pxComma, pxParen, degParen) {
  function pop(s) {
    return s.length ? s.pop() + " " : "";
  }
  function translate(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push("translate(", null, pxComma, null, pxParen);
      q.push({ i: i - 4, x: number2(xa, xb) }, { i: i - 2, x: number2(ya, yb) });
    } else if (xb || yb) {
      s.push("translate(" + xb + pxComma + yb + pxParen);
    }
  }
  function rotate(a2, b, s, q) {
    if (a2 !== b) {
      if (a2 - b > 180) b += 360;
      else if (b - a2 > 180) a2 += 360;
      q.push({ i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: number2(a2, b) });
    } else if (b) {
      s.push(pop(s) + "rotate(" + b + degParen);
    }
  }
  function skewX(a2, b, s, q) {
    if (a2 !== b) {
      q.push({ i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: number2(a2, b) });
    } else if (b) {
      s.push(pop(s) + "skewX(" + b + degParen);
    }
  }
  function scale(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push(pop(s) + "scale(", null, ",", null, ")");
      q.push({ i: i - 4, x: number2(xa, xb) }, { i: i - 2, x: number2(ya, yb) });
    } else if (xb !== 1 || yb !== 1) {
      s.push(pop(s) + "scale(" + xb + "," + yb + ")");
    }
  }
  return function(a2, b) {
    var s = [], q = [];
    a2 = parse(a2), b = parse(b);
    translate(a2.translateX, a2.translateY, b.translateX, b.translateY, s, q);
    rotate(a2.rotate, b.rotate, s, q);
    skewX(a2.skewX, b.skewX, s, q);
    scale(a2.scaleX, a2.scaleY, b.scaleX, b.scaleY, s, q);
    a2 = b = null;
    return function(t) {
      var i = -1, n = q.length, o;
      while (++i < n) s[(o = q[i]).i] = o.x(t);
      return s.join("");
    };
  };
}
var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");
var epsilon2 = 1e-12;
function cosh(x2) {
  return ((x2 = Math.exp(x2)) + 1 / x2) / 2;
}
function sinh(x2) {
  return ((x2 = Math.exp(x2)) - 1 / x2) / 2;
}
function tanh(x2) {
  return ((x2 = Math.exp(2 * x2)) - 1) / (x2 + 1);
}
var zoom = (function zoomRho(rho, rho2, rho4) {
  function zoom2(p0, p1) {
    var ux0 = p0[0], uy0 = p0[1], w0 = p0[2], ux1 = p1[0], uy1 = p1[1], w1 = p1[2], dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy, i, S;
    if (d2 < epsilon2) {
      S = Math.log(w1 / w0) / rho;
      i = function(t) {
        return [
          ux0 + t * dx,
          uy0 + t * dy,
          w0 * Math.exp(rho * t * S)
        ];
      };
    } else {
      var d1 = Math.sqrt(d2), b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1), b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1), r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
      S = (r1 - r0) / rho;
      i = function(t) {
        var s = t * S, coshr0 = cosh(r0), u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
        return [
          ux0 + u * dx,
          uy0 + u * dy,
          w0 * coshr0 / cosh(rho * s + r0)
        ];
      };
    }
    i.duration = Math.abs(S) * 1e3 * rho / Math.SQRT2;
    return i;
  }
  zoom2.rho = function(_) {
    var _1 = Math.max(1e-3, +_), _2 = _1 * _1, _4 = _2 * _2;
    return zoomRho(_1, _2, _4);
  };
  return zoom2;
})(Math.SQRT2, 2, 4);
function hsl2(hue) {
  return function(start, end) {
    var h = hue((start = hsl(start)).h, (end = hsl(end)).h), s = nogamma(start.s, end.s), l = nogamma(start.l, end.l), opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.h = h(t);
      start.s = s(t);
      start.l = l(t);
      start.opacity = opacity(t);
      return start + "";
    };
  };
}
var hsl_default = hsl2(hue$1);
var hslLong = hsl2(nogamma);
function hcl2(hue) {
  return function(start, end) {
    var h = hue((start = hcl(start)).h, (end = hcl(end)).h), c3 = nogamma(start.c, end.c), l = nogamma(start.l, end.l), opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.h = h(t);
      start.c = c3(t);
      start.l = l(t);
      start.opacity = opacity(t);
      return start + "";
    };
  };
}
var hcl_default = hcl2(hue$1);
var hclLong = hcl2(nogamma);
function cubehelix2(hue) {
  return (function cubehelixGamma(y2) {
    y2 = +y2;
    function cubehelix4(start, end) {
      var h = hue((start = cubehelix(start)).h, (end = cubehelix(end)).h), s = nogamma(start.s, end.s), l = nogamma(start.l, end.l), opacity = nogamma(start.opacity, end.opacity);
      return function(t) {
        start.h = h(t);
        start.s = s(t);
        start.l = l(Math.pow(t, y2));
        start.opacity = opacity(t);
        return start + "";
      };
    }
    cubehelix4.gamma = cubehelixGamma;
    return cubehelix4;
  })(1);
}
var cubehelix_default = cubehelix2(hue$1);
var cubehelixLong = cubehelix2(nogamma);

// node_modules/d3-scale/dist/d3-scale.mjs
function initRange(domain, range2) {
  switch (arguments.length) {
    case 0:
      break;
    case 1:
      this.range(domain);
      break;
    default:
      this.range(range2).domain(domain);
      break;
  }
  return this;
}
var implicit = /* @__PURE__ */ Symbol("implicit");
function ordinal() {
  var index4 = new InternMap(), domain = [], range2 = [], unknown = implicit;
  function scale(d) {
    let i = index4.get(d);
    if (i === void 0) {
      if (unknown !== implicit) return unknown;
      index4.set(d, i = domain.push(d) - 1);
    }
    return range2[i % range2.length];
  }
  scale.domain = function(_) {
    if (!arguments.length) return domain.slice();
    domain = [], index4 = new InternMap();
    for (const value of _) {
      if (index4.has(value)) continue;
      index4.set(value, domain.push(value) - 1);
    }
    return scale;
  };
  scale.range = function(_) {
    return arguments.length ? (range2 = Array.from(_), scale) : range2.slice();
  };
  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };
  scale.copy = function() {
    return ordinal(domain, range2).unknown(unknown);
  };
  initRange.apply(scale, arguments);
  return scale;
}

// node_modules/d3-scale-chromatic/dist/d3-scale-chromatic.mjs
function colors(specifier) {
  var n = specifier.length / 6 | 0, colors2 = new Array(n), i = 0;
  while (i < n) colors2[i] = "#" + specifier.slice(i * 6, ++i * 6);
  return colors2;
}
var category10 = colors("1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf");
var Accent = colors("7fc97fbeaed4fdc086ffff99386cb0f0027fbf5b17666666");
var Dark2 = colors("1b9e77d95f027570b3e7298a66a61ee6ab02a6761d666666");
var observable10 = colors("4269d0efb118ff725c6cc5b03ca951ff8ab7a463f297bbf59c6b4e9498a0");
var Paired = colors("a6cee31f78b4b2df8a33a02cfb9a99e31a1cfdbf6fff7f00cab2d66a3d9affff99b15928");
var Pastel1 = colors("fbb4aeb3cde3ccebc5decbe4fed9a6ffffcce5d8bdfddaecf2f2f2");
var Pastel2 = colors("b3e2cdfdcdaccbd5e8f4cae4e6f5c9fff2aef1e2cccccccc");
var Set1 = colors("e41a1c377eb84daf4a984ea3ff7f00ffff33a65628f781bf999999");
var Set2 = colors("66c2a5fc8d628da0cbe78ac3a6d854ffd92fe5c494b3b3b3");
var Set3 = colors("8dd3c7ffffb3bebadafb807280b1d3fdb462b3de69fccde5d9d9d9bc80bdccebc5ffed6f");
var Tableau10 = colors("4e79a7f28e2ce1575976b7b259a14fedc949af7aa1ff9da79c755fbab0ab");
var ramp$1 = (scheme2) => rgbBasis(scheme2[scheme2.length - 1]);
var scheme$q = new Array(3).concat(
  "d8b365f5f5f55ab4ac",
  "a6611adfc27d80cdc1018571",
  "a6611adfc27df5f5f580cdc1018571",
  "8c510ad8b365f6e8c3c7eae55ab4ac01665e",
  "8c510ad8b365f6e8c3f5f5f5c7eae55ab4ac01665e",
  "8c510abf812ddfc27df6e8c3c7eae580cdc135978f01665e",
  "8c510abf812ddfc27df6e8c3f5f5f5c7eae580cdc135978f01665e",
  "5430058c510abf812ddfc27df6e8c3c7eae580cdc135978f01665e003c30",
  "5430058c510abf812ddfc27df6e8c3f5f5f5c7eae580cdc135978f01665e003c30"
).map(colors);
var BrBG = ramp$1(scheme$q);
var scheme$p = new Array(3).concat(
  "af8dc3f7f7f77fbf7b",
  "7b3294c2a5cfa6dba0008837",
  "7b3294c2a5cff7f7f7a6dba0008837",
  "762a83af8dc3e7d4e8d9f0d37fbf7b1b7837",
  "762a83af8dc3e7d4e8f7f7f7d9f0d37fbf7b1b7837",
  "762a839970abc2a5cfe7d4e8d9f0d3a6dba05aae611b7837",
  "762a839970abc2a5cfe7d4e8f7f7f7d9f0d3a6dba05aae611b7837",
  "40004b762a839970abc2a5cfe7d4e8d9f0d3a6dba05aae611b783700441b",
  "40004b762a839970abc2a5cfe7d4e8f7f7f7d9f0d3a6dba05aae611b783700441b"
).map(colors);
var PRGn = ramp$1(scheme$p);
var scheme$o = new Array(3).concat(
  "e9a3c9f7f7f7a1d76a",
  "d01c8bf1b6dab8e1864dac26",
  "d01c8bf1b6daf7f7f7b8e1864dac26",
  "c51b7de9a3c9fde0efe6f5d0a1d76a4d9221",
  "c51b7de9a3c9fde0eff7f7f7e6f5d0a1d76a4d9221",
  "c51b7dde77aef1b6dafde0efe6f5d0b8e1867fbc414d9221",
  "c51b7dde77aef1b6dafde0eff7f7f7e6f5d0b8e1867fbc414d9221",
  "8e0152c51b7dde77aef1b6dafde0efe6f5d0b8e1867fbc414d9221276419",
  "8e0152c51b7dde77aef1b6dafde0eff7f7f7e6f5d0b8e1867fbc414d9221276419"
).map(colors);
var PiYG = ramp$1(scheme$o);
var scheme$n = new Array(3).concat(
  "998ec3f7f7f7f1a340",
  "5e3c99b2abd2fdb863e66101",
  "5e3c99b2abd2f7f7f7fdb863e66101",
  "542788998ec3d8daebfee0b6f1a340b35806",
  "542788998ec3d8daebf7f7f7fee0b6f1a340b35806",
  "5427888073acb2abd2d8daebfee0b6fdb863e08214b35806",
  "5427888073acb2abd2d8daebf7f7f7fee0b6fdb863e08214b35806",
  "2d004b5427888073acb2abd2d8daebfee0b6fdb863e08214b358067f3b08",
  "2d004b5427888073acb2abd2d8daebf7f7f7fee0b6fdb863e08214b358067f3b08"
).map(colors);
var PuOr = ramp$1(scheme$n);
var scheme$m = new Array(3).concat(
  "ef8a62f7f7f767a9cf",
  "ca0020f4a58292c5de0571b0",
  "ca0020f4a582f7f7f792c5de0571b0",
  "b2182bef8a62fddbc7d1e5f067a9cf2166ac",
  "b2182bef8a62fddbc7f7f7f7d1e5f067a9cf2166ac",
  "b2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac",
  "b2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac",
  "67001fb2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac053061",
  "67001fb2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac053061"
).map(colors);
var RdBu = ramp$1(scheme$m);
var scheme$l = new Array(3).concat(
  "ef8a62ffffff999999",
  "ca0020f4a582bababa404040",
  "ca0020f4a582ffffffbababa404040",
  "b2182bef8a62fddbc7e0e0e09999994d4d4d",
  "b2182bef8a62fddbc7ffffffe0e0e09999994d4d4d",
  "b2182bd6604df4a582fddbc7e0e0e0bababa8787874d4d4d",
  "b2182bd6604df4a582fddbc7ffffffe0e0e0bababa8787874d4d4d",
  "67001fb2182bd6604df4a582fddbc7e0e0e0bababa8787874d4d4d1a1a1a",
  "67001fb2182bd6604df4a582fddbc7ffffffe0e0e0bababa8787874d4d4d1a1a1a"
).map(colors);
var RdGy = ramp$1(scheme$l);
var scheme$k = new Array(3).concat(
  "fc8d59ffffbf91bfdb",
  "d7191cfdae61abd9e92c7bb6",
  "d7191cfdae61ffffbfabd9e92c7bb6",
  "d73027fc8d59fee090e0f3f891bfdb4575b4",
  "d73027fc8d59fee090ffffbfe0f3f891bfdb4575b4",
  "d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4",
  "d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4",
  "a50026d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4313695",
  "a50026d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4313695"
).map(colors);
var RdYlBu = ramp$1(scheme$k);
var scheme$j = new Array(3).concat(
  "fc8d59ffffbf91cf60",
  "d7191cfdae61a6d96a1a9641",
  "d7191cfdae61ffffbfa6d96a1a9641",
  "d73027fc8d59fee08bd9ef8b91cf601a9850",
  "d73027fc8d59fee08bffffbfd9ef8b91cf601a9850",
  "d73027f46d43fdae61fee08bd9ef8ba6d96a66bd631a9850",
  "d73027f46d43fdae61fee08bffffbfd9ef8ba6d96a66bd631a9850",
  "a50026d73027f46d43fdae61fee08bd9ef8ba6d96a66bd631a9850006837",
  "a50026d73027f46d43fdae61fee08bffffbfd9ef8ba6d96a66bd631a9850006837"
).map(colors);
var RdYlGn = ramp$1(scheme$j);
var scheme$i = new Array(3).concat(
  "fc8d59ffffbf99d594",
  "d7191cfdae61abdda42b83ba",
  "d7191cfdae61ffffbfabdda42b83ba",
  "d53e4ffc8d59fee08be6f59899d5943288bd",
  "d53e4ffc8d59fee08bffffbfe6f59899d5943288bd",
  "d53e4ff46d43fdae61fee08be6f598abdda466c2a53288bd",
  "d53e4ff46d43fdae61fee08bffffbfe6f598abdda466c2a53288bd",
  "9e0142d53e4ff46d43fdae61fee08be6f598abdda466c2a53288bd5e4fa2",
  "9e0142d53e4ff46d43fdae61fee08bffffbfe6f598abdda466c2a53288bd5e4fa2"
).map(colors);
var Spectral = ramp$1(scheme$i);
var scheme$h = new Array(3).concat(
  "e5f5f999d8c92ca25f",
  "edf8fbb2e2e266c2a4238b45",
  "edf8fbb2e2e266c2a42ca25f006d2c",
  "edf8fbccece699d8c966c2a42ca25f006d2c",
  "edf8fbccece699d8c966c2a441ae76238b45005824",
  "f7fcfde5f5f9ccece699d8c966c2a441ae76238b45005824",
  "f7fcfde5f5f9ccece699d8c966c2a441ae76238b45006d2c00441b"
).map(colors);
var BuGn = ramp$1(scheme$h);
var scheme$g = new Array(3).concat(
  "e0ecf49ebcda8856a7",
  "edf8fbb3cde38c96c688419d",
  "edf8fbb3cde38c96c68856a7810f7c",
  "edf8fbbfd3e69ebcda8c96c68856a7810f7c",
  "edf8fbbfd3e69ebcda8c96c68c6bb188419d6e016b",
  "f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d6e016b",
  "f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d810f7c4d004b"
).map(colors);
var BuPu = ramp$1(scheme$g);
var scheme$f = new Array(3).concat(
  "e0f3dba8ddb543a2ca",
  "f0f9e8bae4bc7bccc42b8cbe",
  "f0f9e8bae4bc7bccc443a2ca0868ac",
  "f0f9e8ccebc5a8ddb57bccc443a2ca0868ac",
  "f0f9e8ccebc5a8ddb57bccc44eb3d32b8cbe08589e",
  "f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe08589e",
  "f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe0868ac084081"
).map(colors);
var GnBu = ramp$1(scheme$f);
var scheme$e = new Array(3).concat(
  "fee8c8fdbb84e34a33",
  "fef0d9fdcc8afc8d59d7301f",
  "fef0d9fdcc8afc8d59e34a33b30000",
  "fef0d9fdd49efdbb84fc8d59e34a33b30000",
  "fef0d9fdd49efdbb84fc8d59ef6548d7301f990000",
  "fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301f990000",
  "fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301fb300007f0000"
).map(colors);
var OrRd = ramp$1(scheme$e);
var scheme$d = new Array(3).concat(
  "ece2f0a6bddb1c9099",
  "f6eff7bdc9e167a9cf02818a",
  "f6eff7bdc9e167a9cf1c9099016c59",
  "f6eff7d0d1e6a6bddb67a9cf1c9099016c59",
  "f6eff7d0d1e6a6bddb67a9cf3690c002818a016450",
  "fff7fbece2f0d0d1e6a6bddb67a9cf3690c002818a016450",
  "fff7fbece2f0d0d1e6a6bddb67a9cf3690c002818a016c59014636"
).map(colors);
var PuBuGn = ramp$1(scheme$d);
var scheme$c = new Array(3).concat(
  "ece7f2a6bddb2b8cbe",
  "f1eef6bdc9e174a9cf0570b0",
  "f1eef6bdc9e174a9cf2b8cbe045a8d",
  "f1eef6d0d1e6a6bddb74a9cf2b8cbe045a8d",
  "f1eef6d0d1e6a6bddb74a9cf3690c00570b0034e7b",
  "fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0034e7b",
  "fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0045a8d023858"
).map(colors);
var PuBu = ramp$1(scheme$c);
var scheme$b = new Array(3).concat(
  "e7e1efc994c7dd1c77",
  "f1eef6d7b5d8df65b0ce1256",
  "f1eef6d7b5d8df65b0dd1c77980043",
  "f1eef6d4b9dac994c7df65b0dd1c77980043",
  "f1eef6d4b9dac994c7df65b0e7298ace125691003f",
  "f7f4f9e7e1efd4b9dac994c7df65b0e7298ace125691003f",
  "f7f4f9e7e1efd4b9dac994c7df65b0e7298ace125698004367001f"
).map(colors);
var PuRd = ramp$1(scheme$b);
var scheme$a = new Array(3).concat(
  "fde0ddfa9fb5c51b8a",
  "feebe2fbb4b9f768a1ae017e",
  "feebe2fbb4b9f768a1c51b8a7a0177",
  "feebe2fcc5c0fa9fb5f768a1c51b8a7a0177",
  "feebe2fcc5c0fa9fb5f768a1dd3497ae017e7a0177",
  "fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a0177",
  "fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a017749006a"
).map(colors);
var RdPu = ramp$1(scheme$a);
var scheme$9 = new Array(3).concat(
  "edf8b17fcdbb2c7fb8",
  "ffffcca1dab441b6c4225ea8",
  "ffffcca1dab441b6c42c7fb8253494",
  "ffffccc7e9b47fcdbb41b6c42c7fb8253494",
  "ffffccc7e9b47fcdbb41b6c41d91c0225ea80c2c84",
  "ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea80c2c84",
  "ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea8253494081d58"
).map(colors);
var YlGnBu = ramp$1(scheme$9);
var scheme$8 = new Array(3).concat(
  "f7fcb9addd8e31a354",
  "ffffccc2e69978c679238443",
  "ffffccc2e69978c67931a354006837",
  "ffffccd9f0a3addd8e78c67931a354006837",
  "ffffccd9f0a3addd8e78c67941ab5d238443005a32",
  "ffffe5f7fcb9d9f0a3addd8e78c67941ab5d238443005a32",
  "ffffe5f7fcb9d9f0a3addd8e78c67941ab5d238443006837004529"
).map(colors);
var YlGn = ramp$1(scheme$8);
var scheme$7 = new Array(3).concat(
  "fff7bcfec44fd95f0e",
  "ffffd4fed98efe9929cc4c02",
  "ffffd4fed98efe9929d95f0e993404",
  "ffffd4fee391fec44ffe9929d95f0e993404",
  "ffffd4fee391fec44ffe9929ec7014cc4c028c2d04",
  "ffffe5fff7bcfee391fec44ffe9929ec7014cc4c028c2d04",
  "ffffe5fff7bcfee391fec44ffe9929ec7014cc4c02993404662506"
).map(colors);
var YlOrBr = ramp$1(scheme$7);
var scheme$6 = new Array(3).concat(
  "ffeda0feb24cf03b20",
  "ffffb2fecc5cfd8d3ce31a1c",
  "ffffb2fecc5cfd8d3cf03b20bd0026",
  "ffffb2fed976feb24cfd8d3cf03b20bd0026",
  "ffffb2fed976feb24cfd8d3cfc4e2ae31a1cb10026",
  "ffffccffeda0fed976feb24cfd8d3cfc4e2ae31a1cb10026",
  "ffffccffeda0fed976feb24cfd8d3cfc4e2ae31a1cbd0026800026"
).map(colors);
var YlOrRd = ramp$1(scheme$6);
var scheme$5 = new Array(3).concat(
  "deebf79ecae13182bd",
  "eff3ffbdd7e76baed62171b5",
  "eff3ffbdd7e76baed63182bd08519c",
  "eff3ffc6dbef9ecae16baed63182bd08519c",
  "eff3ffc6dbef9ecae16baed64292c62171b5084594",
  "f7fbffdeebf7c6dbef9ecae16baed64292c62171b5084594",
  "f7fbffdeebf7c6dbef9ecae16baed64292c62171b508519c08306b"
).map(colors);
var Blues = ramp$1(scheme$5);
var scheme$4 = new Array(3).concat(
  "e5f5e0a1d99b31a354",
  "edf8e9bae4b374c476238b45",
  "edf8e9bae4b374c47631a354006d2c",
  "edf8e9c7e9c0a1d99b74c47631a354006d2c",
  "edf8e9c7e9c0a1d99b74c47641ab5d238b45005a32",
  "f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45005a32",
  "f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45006d2c00441b"
).map(colors);
var Greens = ramp$1(scheme$4);
var scheme$3 = new Array(3).concat(
  "f0f0f0bdbdbd636363",
  "f7f7f7cccccc969696525252",
  "f7f7f7cccccc969696636363252525",
  "f7f7f7d9d9d9bdbdbd969696636363252525",
  "f7f7f7d9d9d9bdbdbd969696737373525252252525",
  "fffffff0f0f0d9d9d9bdbdbd969696737373525252252525",
  "fffffff0f0f0d9d9d9bdbdbd969696737373525252252525000000"
).map(colors);
var Greys = ramp$1(scheme$3);
var scheme$2 = new Array(3).concat(
  "efedf5bcbddc756bb1",
  "f2f0f7cbc9e29e9ac86a51a3",
  "f2f0f7cbc9e29e9ac8756bb154278f",
  "f2f0f7dadaebbcbddc9e9ac8756bb154278f",
  "f2f0f7dadaebbcbddc9e9ac8807dba6a51a34a1486",
  "fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a34a1486",
  "fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a354278f3f007d"
).map(colors);
var Purples = ramp$1(scheme$2);
var scheme$1 = new Array(3).concat(
  "fee0d2fc9272de2d26",
  "fee5d9fcae91fb6a4acb181d",
  "fee5d9fcae91fb6a4ade2d26a50f15",
  "fee5d9fcbba1fc9272fb6a4ade2d26a50f15",
  "fee5d9fcbba1fc9272fb6a4aef3b2ccb181d99000d",
  "fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181d99000d",
  "fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181da50f1567000d"
).map(colors);
var Reds = ramp$1(scheme$1);
var scheme = new Array(3).concat(
  "fee6cefdae6be6550d",
  "feeddefdbe85fd8d3cd94701",
  "feeddefdbe85fd8d3ce6550da63603",
  "feeddefdd0a2fdae6bfd8d3ce6550da63603",
  "feeddefdd0a2fdae6bfd8d3cf16913d948018c2d04",
  "fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d948018c2d04",
  "fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d94801a636037f2704"
).map(colors);
var Oranges = ramp$1(scheme);
var cubehelix3 = cubehelixLong(cubehelix(300, 0.5, 0), cubehelix(-240, 0.5, 1));
var warm = cubehelixLong(cubehelix(-100, 0.75, 0.35), cubehelix(80, 1.5, 0.8));
var cool = cubehelixLong(cubehelix(260, 0.75, 0.35), cubehelix(80, 1.5, 0.8));
var c$1 = cubehelix();
var c2 = rgb();
var pi_1_3 = Math.PI / 3;
var pi_2_3 = Math.PI * 2 / 3;
function ramp(range2) {
  var n = range2.length;
  return function(t) {
    return range2[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
  };
}
var viridis = ramp(colors("44015444025645045745055946075a46085c460a5d460b5e470d60470e6147106347116447136548146748166848176948186a481a6c481b6d481c6e481d6f481f70482071482173482374482475482576482677482878482979472a7a472c7a472d7b472e7c472f7d46307e46327e46337f463480453581453781453882443983443a83443b84433d84433e85423f854240864241864142874144874045884046883f47883f48893e49893e4a893e4c8a3d4d8a3d4e8a3c4f8a3c508b3b518b3b528b3a538b3a548c39558c39568c38588c38598c375a8c375b8d365c8d365d8d355e8d355f8d34608d34618d33628d33638d32648e32658e31668e31678e31688e30698e306a8e2f6b8e2f6c8e2e6d8e2e6e8e2e6f8e2d708e2d718e2c718e2c728e2c738e2b748e2b758e2a768e2a778e2a788e29798e297a8e297b8e287c8e287d8e277e8e277f8e27808e26818e26828e26828e25838e25848e25858e24868e24878e23888e23898e238a8d228b8d228c8d228d8d218e8d218f8d21908d21918c20928c20928c20938c1f948c1f958b1f968b1f978b1f988b1f998a1f9a8a1e9b8a1e9c891e9d891f9e891f9f881fa0881fa1881fa1871fa28720a38620a48621a58521a68522a78522a88423a98324aa8325ab8225ac8226ad8127ad8128ae8029af7f2ab07f2cb17e2db27d2eb37c2fb47c31b57b32b67a34b67935b77937b87838b9773aba763bbb753dbc743fbc7340bd7242be7144bf7046c06f48c16e4ac16d4cc26c4ec36b50c46a52c56954c56856c66758c7655ac8645cc8635ec96260ca6063cb5f65cb5e67cc5c69cd5b6ccd5a6ece5870cf5773d05675d05477d1537ad1517cd2507fd34e81d34d84d44b86d54989d5488bd6468ed64590d74393d74195d84098d83e9bd93c9dd93ba0da39a2da37a5db36a8db34aadc32addc30b0dd2fb2dd2db5de2bb8de29bade28bddf26c0df25c2df23c5e021c8e020cae11fcde11dd0e11cd2e21bd5e21ad8e219dae319dde318dfe318e2e418e5e419e7e419eae51aece51befe51cf1e51df4e61ef6e620f8e621fbe723fde725"));
var magma = ramp(colors("00000401000501010601010802010902020b02020d03030f03031204041405041606051806051a07061c08071e0907200a08220b09240c09260d0a290e0b2b100b2d110c2f120d31130d34140e36150e38160f3b180f3d19103f1a10421c10441d11471e114920114b21114e22115024125325125527125829115a2a115c2c115f2d11612f116331116533106734106936106b38106c390f6e3b0f703d0f713f0f72400f74420f75440f764510774710784910784a10794c117a4e117b4f127b51127c52137c54137d56147d57157e59157e5a167e5c167f5d177f5f187f601880621980641a80651a80671b80681c816a1c816b1d816d1d816e1e81701f81721f817320817521817621817822817922827b23827c23827e24828025828125818326818426818627818827818928818b29818c29818e2a81902a81912b81932b80942c80962c80982d80992d809b2e7f9c2e7f9e2f7fa02f7fa1307ea3307ea5317ea6317da8327daa337dab337cad347cae347bb0357bb2357bb3367ab5367ab73779b83779ba3878bc3978bd3977bf3a77c03a76c23b75c43c75c53c74c73d73c83e73ca3e72cc3f71cd4071cf4070d0416fd2426fd3436ed5446dd6456cd8456cd9466bdb476adc4869de4968df4a68e04c67e24d66e34e65e44f64e55064e75263e85362e95462ea5661eb5760ec5860ed5a5fee5b5eef5d5ef05f5ef1605df2625df2645cf3655cf4675cf4695cf56b5cf66c5cf66e5cf7705cf7725cf8745cf8765cf9785df9795df97b5dfa7d5efa7f5efa815ffb835ffb8560fb8761fc8961fc8a62fc8c63fc8e64fc9065fd9266fd9467fd9668fd9869fd9a6afd9b6bfe9d6cfe9f6dfea16efea36ffea571fea772fea973feaa74feac76feae77feb078feb27afeb47bfeb67cfeb77efeb97ffebb81febd82febf84fec185fec287fec488fec68afec88cfeca8dfecc8ffecd90fecf92fed194fed395fed597fed799fed89afdda9cfddc9efddea0fde0a1fde2a3fde3a5fde5a7fde7a9fde9aafdebacfcecaefceeb0fcf0b2fcf2b4fcf4b6fcf6b8fcf7b9fcf9bbfcfbbdfcfdbf"));
var inferno = ramp(colors("00000401000501010601010802010a02020c02020e03021004031204031405041706041907051b08051d09061f0a07220b07240c08260d08290e092b10092d110a30120a32140b34150b37160b39180c3c190c3e1b0c411c0c431e0c451f0c48210c4a230c4c240c4f260c51280b53290b552b0b572d0b592f0a5b310a5c320a5e340a5f3609613809623909633b09643d09653e0966400a67420a68440a68450a69470b6a490b6a4a0c6b4c0c6b4d0d6c4f0d6c510e6c520e6d540f6d550f6d57106e59106e5a116e5c126e5d126e5f136e61136e62146e64156e65156e67166e69166e6a176e6c186e6d186e6f196e71196e721a6e741a6e751b6e771c6d781c6d7a1d6d7c1d6d7d1e6d7f1e6c801f6c82206c84206b85216b87216b88226a8a226a8c23698d23698f24699025689225689326679526679727669827669a28659b29649d29649f2a63a02a63a22b62a32c61a52c60a62d60a82e5fa92e5eab2f5ead305dae305cb0315bb1325ab3325ab43359b63458b73557b93556ba3655bc3754bd3853bf3952c03a51c13a50c33b4fc43c4ec63d4dc73e4cc83f4bca404acb4149cc4248ce4347cf4446d04545d24644d34743d44842d54a41d74b3fd84c3ed94d3dda4e3cdb503bdd513ade5238df5337e05536e15635e25734e35933e45a31e55c30e65d2fe75e2ee8602de9612bea632aeb6429eb6628ec6726ed6925ee6a24ef6c23ef6e21f06f20f1711ff1731df2741cf3761bf37819f47918f57b17f57d15f67e14f68013f78212f78410f8850ff8870ef8890cf98b0bf98c0af98e09fa9008fa9207fa9407fb9606fb9706fb9906fb9b06fb9d07fc9f07fca108fca309fca50afca60cfca80dfcaa0ffcac11fcae12fcb014fcb216fcb418fbb61afbb81dfbba1ffbbc21fbbe23fac026fac228fac42afac62df9c72ff9c932f9cb35f8cd37f8cf3af7d13df7d340f6d543f6d746f5d949f5db4cf4dd4ff4df53f4e156f3e35af3e55df2e661f2e865f2ea69f1ec6df1ed71f1ef75f1f179f2f27df2f482f3f586f3f68af4f88ef5f992f6fa96f8fb9af9fc9dfafda1fcffa4"));
var plasma = ramp(colors("0d088710078813078916078a19068c1b068d1d068e20068f2206902406912605912805922a05932c05942e05952f059631059733059735049837049938049a3a049a3c049b3e049c3f049c41049d43039e44039e46039f48039f4903a04b03a14c02a14e02a25002a25102a35302a35502a45601a45801a45901a55b01a55c01a65e01a66001a66100a76300a76400a76600a76700a86900a86a00a86c00a86e00a86f00a87100a87201a87401a87501a87701a87801a87a02a87b02a87d03a87e03a88004a88104a78305a78405a78606a68707a68808a68a09a58b0aa58d0ba58e0ca48f0da4910ea3920fa39410a29511a19613a19814a099159f9a169f9c179e9d189d9e199da01a9ca11b9ba21d9aa31e9aa51f99a62098a72197a82296aa2395ab2494ac2694ad2793ae2892b02991b12a90b22b8fb32c8eb42e8db52f8cb6308bb7318ab83289ba3388bb3488bc3587bd3786be3885bf3984c03a83c13b82c23c81c33d80c43e7fc5407ec6417dc7427cc8437bc9447aca457acb4679cc4778cc4977cd4a76ce4b75cf4c74d04d73d14e72d24f71d35171d45270d5536fd5546ed6556dd7566cd8576bd9586ada5a6ada5b69db5c68dc5d67dd5e66de5f65de6164df6263e06363e16462e26561e26660e3685fe4695ee56a5de56b5de66c5ce76e5be76f5ae87059e97158e97257ea7457eb7556eb7655ec7754ed7953ed7a52ee7b51ef7c51ef7e50f07f4ff0804ef1814df1834cf2844bf3854bf3874af48849f48948f58b47f58c46f68d45f68f44f79044f79143f79342f89441f89540f9973ff9983ef99a3efa9b3dfa9c3cfa9e3bfb9f3afba139fba238fca338fca537fca636fca835fca934fdab33fdac33fdae32fdaf31fdb130fdb22ffdb42ffdb52efeb72dfeb82cfeba2cfebb2bfebd2afebe2afec029fdc229fdc328fdc527fdc627fdc827fdca26fdcb26fccd25fcce25fcd025fcd225fbd324fbd524fbd724fad824fada24f9dc24f9dd25f8df25f8e125f7e225f7e425f6e626f6e826f5e926f5eb27f4ed27f3ee27f3f027f2f227f1f426f1f525f0f724f0f921"));

// node_modules/tinycolor2/esm/tinycolor.js
function _typeof(obj) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
    return typeof obj2;
  } : function(obj2) {
    return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
  }, _typeof(obj);
}
var trimLeft = /^\s+/;
var trimRight = /\s+$/;
function tinycolor(color2, opts) {
  color2 = color2 ? color2 : "";
  opts = opts || {};
  if (color2 instanceof tinycolor) {
    return color2;
  }
  if (!(this instanceof tinycolor)) {
    return new tinycolor(color2, opts);
  }
  var rgb3 = inputToRGB(color2);
  this._originalInput = color2, this._r = rgb3.r, this._g = rgb3.g, this._b = rgb3.b, this._a = rgb3.a, this._roundA = Math.round(100 * this._a) / 100, this._format = opts.format || rgb3.format;
  this._gradientType = opts.gradientType;
  if (this._r < 1) this._r = Math.round(this._r);
  if (this._g < 1) this._g = Math.round(this._g);
  if (this._b < 1) this._b = Math.round(this._b);
  this._ok = rgb3.ok;
}
tinycolor.prototype = {
  isDark: function isDark() {
    return this.getBrightness() < 128;
  },
  isLight: function isLight() {
    return !this.isDark();
  },
  isValid: function isValid() {
    return this._ok;
  },
  getOriginalInput: function getOriginalInput() {
    return this._originalInput;
  },
  getFormat: function getFormat() {
    return this._format;
  },
  getAlpha: function getAlpha() {
    return this._a;
  },
  getBrightness: function getBrightness() {
    var rgb3 = this.toRgb();
    return (rgb3.r * 299 + rgb3.g * 587 + rgb3.b * 114) / 1e3;
  },
  getLuminance: function getLuminance() {
    var rgb3 = this.toRgb();
    var RsRGB, GsRGB, BsRGB, R, G, B2;
    RsRGB = rgb3.r / 255;
    GsRGB = rgb3.g / 255;
    BsRGB = rgb3.b / 255;
    if (RsRGB <= 0.03928) R = RsRGB / 12.92;
    else R = Math.pow((RsRGB + 0.055) / 1.055, 2.4);
    if (GsRGB <= 0.03928) G = GsRGB / 12.92;
    else G = Math.pow((GsRGB + 0.055) / 1.055, 2.4);
    if (BsRGB <= 0.03928) B2 = BsRGB / 12.92;
    else B2 = Math.pow((BsRGB + 0.055) / 1.055, 2.4);
    return 0.2126 * R + 0.7152 * G + 0.0722 * B2;
  },
  setAlpha: function setAlpha(value) {
    this._a = boundAlpha(value);
    this._roundA = Math.round(100 * this._a) / 100;
    return this;
  },
  toHsv: function toHsv() {
    var hsv = rgbToHsv(this._r, this._g, this._b);
    return {
      h: hsv.h * 360,
      s: hsv.s,
      v: hsv.v,
      a: this._a
    };
  },
  toHsvString: function toHsvString() {
    var hsv = rgbToHsv(this._r, this._g, this._b);
    var h = Math.round(hsv.h * 360), s = Math.round(hsv.s * 100), v = Math.round(hsv.v * 100);
    return this._a == 1 ? "hsv(" + h + ", " + s + "%, " + v + "%)" : "hsva(" + h + ", " + s + "%, " + v + "%, " + this._roundA + ")";
  },
  toHsl: function toHsl() {
    var hsl3 = rgbToHsl(this._r, this._g, this._b);
    return {
      h: hsl3.h * 360,
      s: hsl3.s,
      l: hsl3.l,
      a: this._a
    };
  },
  toHslString: function toHslString() {
    var hsl3 = rgbToHsl(this._r, this._g, this._b);
    var h = Math.round(hsl3.h * 360), s = Math.round(hsl3.s * 100), l = Math.round(hsl3.l * 100);
    return this._a == 1 ? "hsl(" + h + ", " + s + "%, " + l + "%)" : "hsla(" + h + ", " + s + "%, " + l + "%, " + this._roundA + ")";
  },
  toHex: function toHex(allow3Char) {
    return rgbToHex(this._r, this._g, this._b, allow3Char);
  },
  toHexString: function toHexString(allow3Char) {
    return "#" + this.toHex(allow3Char);
  },
  toHex8: function toHex8(allow4Char) {
    return rgbaToHex(this._r, this._g, this._b, this._a, allow4Char);
  },
  toHex8String: function toHex8String(allow4Char) {
    return "#" + this.toHex8(allow4Char);
  },
  toRgb: function toRgb() {
    return {
      r: Math.round(this._r),
      g: Math.round(this._g),
      b: Math.round(this._b),
      a: this._a
    };
  },
  toRgbString: function toRgbString() {
    return this._a == 1 ? "rgb(" + Math.round(this._r) + ", " + Math.round(this._g) + ", " + Math.round(this._b) + ")" : "rgba(" + Math.round(this._r) + ", " + Math.round(this._g) + ", " + Math.round(this._b) + ", " + this._roundA + ")";
  },
  toPercentageRgb: function toPercentageRgb() {
    return {
      r: Math.round(bound01(this._r, 255) * 100) + "%",
      g: Math.round(bound01(this._g, 255) * 100) + "%",
      b: Math.round(bound01(this._b, 255) * 100) + "%",
      a: this._a
    };
  },
  toPercentageRgbString: function toPercentageRgbString() {
    return this._a == 1 ? "rgb(" + Math.round(bound01(this._r, 255) * 100) + "%, " + Math.round(bound01(this._g, 255) * 100) + "%, " + Math.round(bound01(this._b, 255) * 100) + "%)" : "rgba(" + Math.round(bound01(this._r, 255) * 100) + "%, " + Math.round(bound01(this._g, 255) * 100) + "%, " + Math.round(bound01(this._b, 255) * 100) + "%, " + this._roundA + ")";
  },
  toName: function toName() {
    if (this._a === 0) {
      return "transparent";
    }
    if (this._a < 1) {
      return false;
    }
    return hexNames[rgbToHex(this._r, this._g, this._b, true)] || false;
  },
  toFilter: function toFilter(secondColor) {
    var hex8String = "#" + rgbaToArgbHex(this._r, this._g, this._b, this._a);
    var secondHex8String = hex8String;
    var gradientType = this._gradientType ? "GradientType = 1, " : "";
    if (secondColor) {
      var s = tinycolor(secondColor);
      secondHex8String = "#" + rgbaToArgbHex(s._r, s._g, s._b, s._a);
    }
    return "progid:DXImageTransform.Microsoft.gradient(" + gradientType + "startColorstr=" + hex8String + ",endColorstr=" + secondHex8String + ")";
  },
  toString: function toString(format) {
    var formatSet = !!format;
    format = format || this._format;
    var formattedString = false;
    var hasAlpha = this._a < 1 && this._a >= 0;
    var needsAlphaFormat = !formatSet && hasAlpha && (format === "hex" || format === "hex6" || format === "hex3" || format === "hex4" || format === "hex8" || format === "name");
    if (needsAlphaFormat) {
      if (format === "name" && this._a === 0) {
        return this.toName();
      }
      return this.toRgbString();
    }
    if (format === "rgb") {
      formattedString = this.toRgbString();
    }
    if (format === "prgb") {
      formattedString = this.toPercentageRgbString();
    }
    if (format === "hex" || format === "hex6") {
      formattedString = this.toHexString();
    }
    if (format === "hex3") {
      formattedString = this.toHexString(true);
    }
    if (format === "hex4") {
      formattedString = this.toHex8String(true);
    }
    if (format === "hex8") {
      formattedString = this.toHex8String();
    }
    if (format === "name") {
      formattedString = this.toName();
    }
    if (format === "hsl") {
      formattedString = this.toHslString();
    }
    if (format === "hsv") {
      formattedString = this.toHsvString();
    }
    return formattedString || this.toHexString();
  },
  clone: function clone() {
    return tinycolor(this.toString());
  },
  _applyModification: function _applyModification(fn, args) {
    var color2 = fn.apply(null, [this].concat([].slice.call(args)));
    this._r = color2._r;
    this._g = color2._g;
    this._b = color2._b;
    this.setAlpha(color2._a);
    return this;
  },
  lighten: function lighten() {
    return this._applyModification(_lighten, arguments);
  },
  brighten: function brighten() {
    return this._applyModification(_brighten, arguments);
  },
  darken: function darken() {
    return this._applyModification(_darken, arguments);
  },
  desaturate: function desaturate() {
    return this._applyModification(_desaturate, arguments);
  },
  saturate: function saturate() {
    return this._applyModification(_saturate, arguments);
  },
  greyscale: function greyscale() {
    return this._applyModification(_greyscale, arguments);
  },
  spin: function spin() {
    return this._applyModification(_spin, arguments);
  },
  _applyCombination: function _applyCombination(fn, args) {
    return fn.apply(null, [this].concat([].slice.call(args)));
  },
  analogous: function analogous() {
    return this._applyCombination(_analogous, arguments);
  },
  complement: function complement() {
    return this._applyCombination(_complement, arguments);
  },
  monochromatic: function monochromatic() {
    return this._applyCombination(_monochromatic, arguments);
  },
  splitcomplement: function splitcomplement() {
    return this._applyCombination(_splitcomplement, arguments);
  },
  // Disabled until https://github.com/bgrins/TinyColor/issues/254
  // polyad: function (number) {
  //   return this._applyCombination(polyad, [number]);
  // },
  triad: function triad() {
    return this._applyCombination(polyad, [3]);
  },
  tetrad: function tetrad() {
    return this._applyCombination(polyad, [4]);
  }
};
tinycolor.fromRatio = function(color2, opts) {
  if (_typeof(color2) == "object") {
    var newColor = {};
    for (var i in color2) {
      if (color2.hasOwnProperty(i)) {
        if (i === "a") {
          newColor[i] = color2[i];
        } else {
          newColor[i] = convertToPercentage(color2[i]);
        }
      }
    }
    color2 = newColor;
  }
  return tinycolor(color2, opts);
};
function inputToRGB(color2) {
  var rgb3 = {
    r: 0,
    g: 0,
    b: 0
  };
  var a2 = 1;
  var s = null;
  var v = null;
  var l = null;
  var ok = false;
  var format = false;
  if (typeof color2 == "string") {
    color2 = stringInputToObject(color2);
  }
  if (_typeof(color2) == "object") {
    if (isValidCSSUnit(color2.r) && isValidCSSUnit(color2.g) && isValidCSSUnit(color2.b)) {
      rgb3 = rgbToRgb(color2.r, color2.g, color2.b);
      ok = true;
      format = String(color2.r).substr(-1) === "%" ? "prgb" : "rgb";
    } else if (isValidCSSUnit(color2.h) && isValidCSSUnit(color2.s) && isValidCSSUnit(color2.v)) {
      s = convertToPercentage(color2.s);
      v = convertToPercentage(color2.v);
      rgb3 = hsvToRgb(color2.h, s, v);
      ok = true;
      format = "hsv";
    } else if (isValidCSSUnit(color2.h) && isValidCSSUnit(color2.s) && isValidCSSUnit(color2.l)) {
      s = convertToPercentage(color2.s);
      l = convertToPercentage(color2.l);
      rgb3 = hslToRgb(color2.h, s, l);
      ok = true;
      format = "hsl";
    }
    if (color2.hasOwnProperty("a")) {
      a2 = color2.a;
    }
  }
  a2 = boundAlpha(a2);
  return {
    ok,
    format: color2.format || format,
    r: Math.min(255, Math.max(rgb3.r, 0)),
    g: Math.min(255, Math.max(rgb3.g, 0)),
    b: Math.min(255, Math.max(rgb3.b, 0)),
    a: a2
  };
}
function rgbToRgb(r, g, b) {
  return {
    r: bound01(r, 255) * 255,
    g: bound01(g, 255) * 255,
    b: bound01(b, 255) * 255
  };
}
function rgbToHsl(r, g, b) {
  r = bound01(r, 255);
  g = bound01(g, 255);
  b = bound01(b, 255);
  var max2 = Math.max(r, g, b), min2 = Math.min(r, g, b);
  var h, s, l = (max2 + min2) / 2;
  if (max2 == min2) {
    h = s = 0;
  } else {
    var d = max2 - min2;
    s = l > 0.5 ? d / (2 - max2 - min2) : d / (max2 + min2);
    switch (max2) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h,
    s,
    l
  };
}
function hslToRgb(h, s, l) {
  var r, g, b;
  h = bound01(h, 360);
  s = bound01(s, 100);
  l = bound01(l, 100);
  function hue2rgb(p2, q2, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p2 + (q2 - p2) * 6 * t;
    if (t < 1 / 2) return q2;
    if (t < 2 / 3) return p2 + (q2 - p2) * (2 / 3 - t) * 6;
    return p2;
  }
  if (s === 0) {
    r = g = b = l;
  } else {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return {
    r: r * 255,
    g: g * 255,
    b: b * 255
  };
}
function rgbToHsv(r, g, b) {
  r = bound01(r, 255);
  g = bound01(g, 255);
  b = bound01(b, 255);
  var max2 = Math.max(r, g, b), min2 = Math.min(r, g, b);
  var h, s, v = max2;
  var d = max2 - min2;
  s = max2 === 0 ? 0 : d / max2;
  if (max2 == min2) {
    h = 0;
  } else {
    switch (max2) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h,
    s,
    v
  };
}
function hsvToRgb(h, s, v) {
  h = bound01(h, 360) * 6;
  s = bound01(s, 100);
  v = bound01(v, 100);
  var i = Math.floor(h), f = h - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s), mod = i % 6, r = [v, q, p, p, t, v][mod], g = [t, v, v, q, p, p][mod], b = [p, p, t, v, v, q][mod];
  return {
    r: r * 255,
    g: g * 255,
    b: b * 255
  };
}
function rgbToHex(r, g, b, allow3Char) {
  var hex2 = [pad2(Math.round(r).toString(16)), pad2(Math.round(g).toString(16)), pad2(Math.round(b).toString(16))];
  if (allow3Char && hex2[0].charAt(0) == hex2[0].charAt(1) && hex2[1].charAt(0) == hex2[1].charAt(1) && hex2[2].charAt(0) == hex2[2].charAt(1)) {
    return hex2[0].charAt(0) + hex2[1].charAt(0) + hex2[2].charAt(0);
  }
  return hex2.join("");
}
function rgbaToHex(r, g, b, a2, allow4Char) {
  var hex2 = [pad2(Math.round(r).toString(16)), pad2(Math.round(g).toString(16)), pad2(Math.round(b).toString(16)), pad2(convertDecimalToHex(a2))];
  if (allow4Char && hex2[0].charAt(0) == hex2[0].charAt(1) && hex2[1].charAt(0) == hex2[1].charAt(1) && hex2[2].charAt(0) == hex2[2].charAt(1) && hex2[3].charAt(0) == hex2[3].charAt(1)) {
    return hex2[0].charAt(0) + hex2[1].charAt(0) + hex2[2].charAt(0) + hex2[3].charAt(0);
  }
  return hex2.join("");
}
function rgbaToArgbHex(r, g, b, a2) {
  var hex2 = [pad2(convertDecimalToHex(a2)), pad2(Math.round(r).toString(16)), pad2(Math.round(g).toString(16)), pad2(Math.round(b).toString(16))];
  return hex2.join("");
}
tinycolor.equals = function(color1, color2) {
  if (!color1 || !color2) return false;
  return tinycolor(color1).toRgbString() == tinycolor(color2).toRgbString();
};
tinycolor.random = function() {
  return tinycolor.fromRatio({
    r: Math.random(),
    g: Math.random(),
    b: Math.random()
  });
};
function _desaturate(color2, amount) {
  amount = amount === 0 ? 0 : amount || 10;
  var hsl3 = tinycolor(color2).toHsl();
  hsl3.s -= amount / 100;
  hsl3.s = clamp01(hsl3.s);
  return tinycolor(hsl3);
}
function _saturate(color2, amount) {
  amount = amount === 0 ? 0 : amount || 10;
  var hsl3 = tinycolor(color2).toHsl();
  hsl3.s += amount / 100;
  hsl3.s = clamp01(hsl3.s);
  return tinycolor(hsl3);
}
function _greyscale(color2) {
  return tinycolor(color2).desaturate(100);
}
function _lighten(color2, amount) {
  amount = amount === 0 ? 0 : amount || 10;
  var hsl3 = tinycolor(color2).toHsl();
  hsl3.l += amount / 100;
  hsl3.l = clamp01(hsl3.l);
  return tinycolor(hsl3);
}
function _brighten(color2, amount) {
  amount = amount === 0 ? 0 : amount || 10;
  var rgb3 = tinycolor(color2).toRgb();
  rgb3.r = Math.max(0, Math.min(255, rgb3.r - Math.round(255 * -(amount / 100))));
  rgb3.g = Math.max(0, Math.min(255, rgb3.g - Math.round(255 * -(amount / 100))));
  rgb3.b = Math.max(0, Math.min(255, rgb3.b - Math.round(255 * -(amount / 100))));
  return tinycolor(rgb3);
}
function _darken(color2, amount) {
  amount = amount === 0 ? 0 : amount || 10;
  var hsl3 = tinycolor(color2).toHsl();
  hsl3.l -= amount / 100;
  hsl3.l = clamp01(hsl3.l);
  return tinycolor(hsl3);
}
function _spin(color2, amount) {
  var hsl3 = tinycolor(color2).toHsl();
  var hue = (hsl3.h + amount) % 360;
  hsl3.h = hue < 0 ? 360 + hue : hue;
  return tinycolor(hsl3);
}
function _complement(color2) {
  var hsl3 = tinycolor(color2).toHsl();
  hsl3.h = (hsl3.h + 180) % 360;
  return tinycolor(hsl3);
}
function polyad(color2, number3) {
  if (isNaN(number3) || number3 <= 0) {
    throw new Error("Argument to polyad must be a positive number");
  }
  var hsl3 = tinycolor(color2).toHsl();
  var result = [tinycolor(color2)];
  var step = 360 / number3;
  for (var i = 1; i < number3; i++) {
    result.push(tinycolor({
      h: (hsl3.h + i * step) % 360,
      s: hsl3.s,
      l: hsl3.l
    }));
  }
  return result;
}
function _splitcomplement(color2) {
  var hsl3 = tinycolor(color2).toHsl();
  var h = hsl3.h;
  return [tinycolor(color2), tinycolor({
    h: (h + 72) % 360,
    s: hsl3.s,
    l: hsl3.l
  }), tinycolor({
    h: (h + 216) % 360,
    s: hsl3.s,
    l: hsl3.l
  })];
}
function _analogous(color2, results, slices) {
  results = results || 6;
  slices = slices || 30;
  var hsl3 = tinycolor(color2).toHsl();
  var part = 360 / slices;
  var ret = [tinycolor(color2)];
  for (hsl3.h = (hsl3.h - (part * results >> 1) + 720) % 360; --results; ) {
    hsl3.h = (hsl3.h + part) % 360;
    ret.push(tinycolor(hsl3));
  }
  return ret;
}
function _monochromatic(color2, results) {
  results = results || 6;
  var hsv = tinycolor(color2).toHsv();
  var h = hsv.h, s = hsv.s, v = hsv.v;
  var ret = [];
  var modification = 1 / results;
  while (results--) {
    ret.push(tinycolor({
      h,
      s,
      v
    }));
    v = (v + modification) % 1;
  }
  return ret;
}
tinycolor.mix = function(color1, color2, amount) {
  amount = amount === 0 ? 0 : amount || 50;
  var rgb1 = tinycolor(color1).toRgb();
  var rgb22 = tinycolor(color2).toRgb();
  var p = amount / 100;
  var rgba2 = {
    r: (rgb22.r - rgb1.r) * p + rgb1.r,
    g: (rgb22.g - rgb1.g) * p + rgb1.g,
    b: (rgb22.b - rgb1.b) * p + rgb1.b,
    a: (rgb22.a - rgb1.a) * p + rgb1.a
  };
  return tinycolor(rgba2);
};
tinycolor.readability = function(color1, color2) {
  var c1 = tinycolor(color1);
  var c22 = tinycolor(color2);
  return (Math.max(c1.getLuminance(), c22.getLuminance()) + 0.05) / (Math.min(c1.getLuminance(), c22.getLuminance()) + 0.05);
};
tinycolor.isReadable = function(color1, color2, wcag2) {
  var readability = tinycolor.readability(color1, color2);
  var wcag2Parms, out;
  out = false;
  wcag2Parms = validateWCAG2Parms(wcag2);
  switch (wcag2Parms.level + wcag2Parms.size) {
    case "AAsmall":
    case "AAAlarge":
      out = readability >= 4.5;
      break;
    case "AAlarge":
      out = readability >= 3;
      break;
    case "AAAsmall":
      out = readability >= 7;
      break;
  }
  return out;
};
tinycolor.mostReadable = function(baseColor, colorList, args) {
  var bestColor = null;
  var bestScore = 0;
  var readability;
  var includeFallbackColors, level, size;
  args = args || {};
  includeFallbackColors = args.includeFallbackColors;
  level = args.level;
  size = args.size;
  for (var i = 0; i < colorList.length; i++) {
    readability = tinycolor.readability(baseColor, colorList[i]);
    if (readability > bestScore) {
      bestScore = readability;
      bestColor = tinycolor(colorList[i]);
    }
  }
  if (tinycolor.isReadable(baseColor, bestColor, {
    level,
    size
  }) || !includeFallbackColors) {
    return bestColor;
  } else {
    args.includeFallbackColors = false;
    return tinycolor.mostReadable(baseColor, ["#fff", "#000"], args);
  }
};
var names = tinycolor.names = {
  aliceblue: "f0f8ff",
  antiquewhite: "faebd7",
  aqua: "0ff",
  aquamarine: "7fffd4",
  azure: "f0ffff",
  beige: "f5f5dc",
  bisque: "ffe4c4",
  black: "000",
  blanchedalmond: "ffebcd",
  blue: "00f",
  blueviolet: "8a2be2",
  brown: "a52a2a",
  burlywood: "deb887",
  burntsienna: "ea7e5d",
  cadetblue: "5f9ea0",
  chartreuse: "7fff00",
  chocolate: "d2691e",
  coral: "ff7f50",
  cornflowerblue: "6495ed",
  cornsilk: "fff8dc",
  crimson: "dc143c",
  cyan: "0ff",
  darkblue: "00008b",
  darkcyan: "008b8b",
  darkgoldenrod: "b8860b",
  darkgray: "a9a9a9",
  darkgreen: "006400",
  darkgrey: "a9a9a9",
  darkkhaki: "bdb76b",
  darkmagenta: "8b008b",
  darkolivegreen: "556b2f",
  darkorange: "ff8c00",
  darkorchid: "9932cc",
  darkred: "8b0000",
  darksalmon: "e9967a",
  darkseagreen: "8fbc8f",
  darkslateblue: "483d8b",
  darkslategray: "2f4f4f",
  darkslategrey: "2f4f4f",
  darkturquoise: "00ced1",
  darkviolet: "9400d3",
  deeppink: "ff1493",
  deepskyblue: "00bfff",
  dimgray: "696969",
  dimgrey: "696969",
  dodgerblue: "1e90ff",
  firebrick: "b22222",
  floralwhite: "fffaf0",
  forestgreen: "228b22",
  fuchsia: "f0f",
  gainsboro: "dcdcdc",
  ghostwhite: "f8f8ff",
  gold: "ffd700",
  goldenrod: "daa520",
  gray: "808080",
  green: "008000",
  greenyellow: "adff2f",
  grey: "808080",
  honeydew: "f0fff0",
  hotpink: "ff69b4",
  indianred: "cd5c5c",
  indigo: "4b0082",
  ivory: "fffff0",
  khaki: "f0e68c",
  lavender: "e6e6fa",
  lavenderblush: "fff0f5",
  lawngreen: "7cfc00",
  lemonchiffon: "fffacd",
  lightblue: "add8e6",
  lightcoral: "f08080",
  lightcyan: "e0ffff",
  lightgoldenrodyellow: "fafad2",
  lightgray: "d3d3d3",
  lightgreen: "90ee90",
  lightgrey: "d3d3d3",
  lightpink: "ffb6c1",
  lightsalmon: "ffa07a",
  lightseagreen: "20b2aa",
  lightskyblue: "87cefa",
  lightslategray: "789",
  lightslategrey: "789",
  lightsteelblue: "b0c4de",
  lightyellow: "ffffe0",
  lime: "0f0",
  limegreen: "32cd32",
  linen: "faf0e6",
  magenta: "f0f",
  maroon: "800000",
  mediumaquamarine: "66cdaa",
  mediumblue: "0000cd",
  mediumorchid: "ba55d3",
  mediumpurple: "9370db",
  mediumseagreen: "3cb371",
  mediumslateblue: "7b68ee",
  mediumspringgreen: "00fa9a",
  mediumturquoise: "48d1cc",
  mediumvioletred: "c71585",
  midnightblue: "191970",
  mintcream: "f5fffa",
  mistyrose: "ffe4e1",
  moccasin: "ffe4b5",
  navajowhite: "ffdead",
  navy: "000080",
  oldlace: "fdf5e6",
  olive: "808000",
  olivedrab: "6b8e23",
  orange: "ffa500",
  orangered: "ff4500",
  orchid: "da70d6",
  palegoldenrod: "eee8aa",
  palegreen: "98fb98",
  paleturquoise: "afeeee",
  palevioletred: "db7093",
  papayawhip: "ffefd5",
  peachpuff: "ffdab9",
  peru: "cd853f",
  pink: "ffc0cb",
  plum: "dda0dd",
  powderblue: "b0e0e6",
  purple: "800080",
  rebeccapurple: "663399",
  red: "f00",
  rosybrown: "bc8f8f",
  royalblue: "4169e1",
  saddlebrown: "8b4513",
  salmon: "fa8072",
  sandybrown: "f4a460",
  seagreen: "2e8b57",
  seashell: "fff5ee",
  sienna: "a0522d",
  silver: "c0c0c0",
  skyblue: "87ceeb",
  slateblue: "6a5acd",
  slategray: "708090",
  slategrey: "708090",
  snow: "fffafa",
  springgreen: "00ff7f",
  steelblue: "4682b4",
  tan: "d2b48c",
  teal: "008080",
  thistle: "d8bfd8",
  tomato: "ff6347",
  turquoise: "40e0d0",
  violet: "ee82ee",
  wheat: "f5deb3",
  white: "fff",
  whitesmoke: "f5f5f5",
  yellow: "ff0",
  yellowgreen: "9acd32"
};
var hexNames = tinycolor.hexNames = flip(names);
function flip(o) {
  var flipped = {};
  for (var i in o) {
    if (o.hasOwnProperty(i)) {
      flipped[o[i]] = i;
    }
  }
  return flipped;
}
function boundAlpha(a2) {
  a2 = parseFloat(a2);
  if (isNaN(a2) || a2 < 0 || a2 > 1) {
    a2 = 1;
  }
  return a2;
}
function bound01(n, max2) {
  if (isOnePointZero(n)) n = "100%";
  var processPercent = isPercentage(n);
  n = Math.min(max2, Math.max(0, parseFloat(n)));
  if (processPercent) {
    n = parseInt(n * max2, 10) / 100;
  }
  if (Math.abs(n - max2) < 1e-6) {
    return 1;
  }
  return n % max2 / parseFloat(max2);
}
function clamp01(val) {
  return Math.min(1, Math.max(0, val));
}
function parseIntFromHex(val) {
  return parseInt(val, 16);
}
function isOnePointZero(n) {
  return typeof n == "string" && n.indexOf(".") != -1 && parseFloat(n) === 1;
}
function isPercentage(n) {
  return typeof n === "string" && n.indexOf("%") != -1;
}
function pad2(c3) {
  return c3.length == 1 ? "0" + c3 : "" + c3;
}
function convertToPercentage(n) {
  if (n <= 1) {
    n = n * 100 + "%";
  }
  return n;
}
function convertDecimalToHex(d) {
  return Math.round(parseFloat(d) * 255).toString(16);
}
function convertHexToDecimal(h) {
  return parseIntFromHex(h) / 255;
}
var matchers = (function() {
  var CSS_INTEGER = "[-\\+]?\\d+%?";
  var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";
  var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";
  var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
  var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
  return {
    CSS_UNIT: new RegExp(CSS_UNIT),
    rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
    rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
    hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
    hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
    hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
    hsva: new RegExp("hsva" + PERMISSIVE_MATCH4),
    hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
    hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
    hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
    hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
  };
})();
function isValidCSSUnit(color2) {
  return !!matchers.CSS_UNIT.exec(color2);
}
function stringInputToObject(color2) {
  color2 = color2.replace(trimLeft, "").replace(trimRight, "").toLowerCase();
  var named2 = false;
  if (names[color2]) {
    color2 = names[color2];
    named2 = true;
  } else if (color2 == "transparent") {
    return {
      r: 0,
      g: 0,
      b: 0,
      a: 0,
      format: "name"
    };
  }
  var match;
  if (match = matchers.rgb.exec(color2)) {
    return {
      r: match[1],
      g: match[2],
      b: match[3]
    };
  }
  if (match = matchers.rgba.exec(color2)) {
    return {
      r: match[1],
      g: match[2],
      b: match[3],
      a: match[4]
    };
  }
  if (match = matchers.hsl.exec(color2)) {
    return {
      h: match[1],
      s: match[2],
      l: match[3]
    };
  }
  if (match = matchers.hsla.exec(color2)) {
    return {
      h: match[1],
      s: match[2],
      l: match[3],
      a: match[4]
    };
  }
  if (match = matchers.hsv.exec(color2)) {
    return {
      h: match[1],
      s: match[2],
      v: match[3]
    };
  }
  if (match = matchers.hsva.exec(color2)) {
    return {
      h: match[1],
      s: match[2],
      v: match[3],
      a: match[4]
    };
  }
  if (match = matchers.hex8.exec(color2)) {
    return {
      r: parseIntFromHex(match[1]),
      g: parseIntFromHex(match[2]),
      b: parseIntFromHex(match[3]),
      a: convertHexToDecimal(match[4]),
      format: named2 ? "name" : "hex8"
    };
  }
  if (match = matchers.hex6.exec(color2)) {
    return {
      r: parseIntFromHex(match[1]),
      g: parseIntFromHex(match[2]),
      b: parseIntFromHex(match[3]),
      format: named2 ? "name" : "hex"
    };
  }
  if (match = matchers.hex4.exec(color2)) {
    return {
      r: parseIntFromHex(match[1] + "" + match[1]),
      g: parseIntFromHex(match[2] + "" + match[2]),
      b: parseIntFromHex(match[3] + "" + match[3]),
      a: convertHexToDecimal(match[4] + "" + match[4]),
      format: named2 ? "name" : "hex8"
    };
  }
  if (match = matchers.hex3.exec(color2)) {
    return {
      r: parseIntFromHex(match[1] + "" + match[1]),
      g: parseIntFromHex(match[2] + "" + match[2]),
      b: parseIntFromHex(match[3] + "" + match[3]),
      format: named2 ? "name" : "hex"
    };
  }
  return false;
}
function validateWCAG2Parms(parms) {
  var level, size;
  parms = parms || {
    level: "AA",
    size: "small"
  };
  level = (parms.level || "AA").toUpperCase();
  size = (parms.size || "small").toLowerCase();
  if (level !== "AA" && level !== "AAA") {
    level = "AA";
  }
  if (size !== "small" && size !== "large") {
    size = "small";
  }
  return {
    level,
    size
  };
}

// node_modules/three-forcegraph/dist/three-forcegraph.mjs
var materialDispose = (material) => {
  if (material instanceof Array) {
    material.forEach(materialDispose);
  } else {
    if (material.map) {
      material.map.dispose();
    }
    material.dispose();
  }
};
var deallocate = (obj) => {
  if (obj.geometry) {
    obj.geometry.dispose();
  }
  if (obj.material) {
    materialDispose(obj.material);
  }
  if (obj.texture) {
    obj.texture.dispose();
  }
  if (obj.children) {
    obj.children.forEach(deallocate);
  }
};
var emptyObject = (obj) => {
  while (obj.children.length) {
    const childObj = obj.children[0];
    obj.remove(childObj);
    deallocate(childObj);
  }
};
var ThreeDigest = class extends DataBindMapper {
  constructor(scene, {
    dataBindAttr = "__data",
    objBindAttr = "__threeObj"
  } = {}) {
    super();
    this.scene = scene;
    this.#dataBindAttr = dataBindAttr;
    this.#objBindAttr = objBindAttr;
    this.onRemoveObj(() => {
    });
  }
  onCreateObj(fn) {
    super.onCreateObj((d) => {
      const obj = fn(d);
      d[this.#objBindAttr] = obj;
      obj[this.#dataBindAttr] = d;
      this.scene.add(obj);
      return obj;
    });
    return this;
  }
  onRemoveObj(fn) {
    super.onRemoveObj((obj, dId) => {
      const d = super.getData(obj);
      fn(obj, dId);
      this.scene.remove(obj);
      deallocate(obj);
      delete d[this.#objBindAttr];
    });
    return this;
  }
  scene;
  #dataBindAttr;
  #objBindAttr;
};
var colorStr2Hex = (str) => isNaN(str) ? parseInt(tinycolor(str).toHex(), 16) : str;
var colorAlpha = (str) => isNaN(str) ? tinycolor(str).getAlpha() : 1;
var autoColorScale = ordinal(Paired);
function autoColorObjects(objects, colorByAccessor, colorField) {
  if (!colorByAccessor || typeof colorField !== "string") return;
  objects.filter((obj) => !obj[colorField]).forEach((obj) => {
    obj[colorField] = autoColorScale(colorByAccessor(obj));
  });
}
function getDagDepths({
  nodes,
  links
}, idAccessor, {
  nodeFilter = () => true,
  onLoopError = (loopIds) => {
    throw `Invalid DAG structure! Found cycle in node path: ${loopIds.join(" -> ")}.`;
  }
} = {}) {
  const graph = {};
  nodes.forEach((node) => graph[idAccessor(node)] = {
    data: node,
    out: [],
    depth: -1,
    skip: !nodeFilter(node)
  });
  links.forEach(({
    source,
    target
  }) => {
    const sourceId = getNodeId(source);
    const targetId = getNodeId(target);
    if (!graph.hasOwnProperty(sourceId)) throw `Missing source node with id: ${sourceId}`;
    if (!graph.hasOwnProperty(targetId)) throw `Missing target node with id: ${targetId}`;
    const sourceNode = graph[sourceId];
    const targetNode = graph[targetId];
    sourceNode.out.push(targetNode);
    function getNodeId(node) {
      return typeof node === "object" ? idAccessor(node) : node;
    }
  });
  const foundLoops = [];
  traverse(Object.values(graph));
  const nodeDepths = Object.assign({}, ...Object.entries(graph).filter(([, node]) => !node.skip).map(([id, node]) => ({
    [id]: node.depth
  })));
  return nodeDepths;
  function traverse(nodes2, nodeStack = [], currentDepth = 0) {
    for (let i = 0, l = nodes2.length; i < l; i++) {
      const node = nodes2[i];
      if (nodeStack.indexOf(node) !== -1) {
        const loop = [...nodeStack.slice(nodeStack.indexOf(node)), node].map((d) => idAccessor(d.data));
        if (!foundLoops.some((foundLoop) => foundLoop.length === loop.length && foundLoop.every((id, idx) => id === loop[idx]))) {
          foundLoops.push(loop);
          onLoopError(loop);
        }
        continue;
      }
      if (currentDepth > node.depth) {
        node.depth = currentDepth;
        traverse(node.out, [...nodeStack, node], currentDepth + (node.skip ? 0 : 1));
      }
    }
  }
}
var three$1 = window.THREE ? window.THREE : {
  Group,
  Mesh,
  MeshLambertMaterial,
  Color: Color2,
  BufferGeometry,
  BufferAttribute,
  Matrix4,
  Vector3,
  SphereGeometry,
  CylinderGeometry,
  TubeGeometry,
  ConeGeometry,
  Line,
  LineBasicMaterial,
  QuadraticBezierCurve3,
  CubicBezierCurve3,
  Box3
};
var ngraph = {
  graph: ngraph_default,
  forcelayout: import_ngraph3.default
};
var DAG_LEVEL_NODE_RATIO = 2;
var setAttributeFn = new three$1.BufferGeometry().setAttribute ? "setAttribute" : "addAttribute";
var applyMatrix4Fn = new three$1.BufferGeometry().applyMatrix4 ? "applyMatrix4" : "applyMatrix";
var ForceGraph = index2({
  props: {
    jsonUrl: {
      onChange: function(jsonUrl, state) {
        if (jsonUrl && !state.fetchingJson) {
          state.fetchingJson = true;
          state.onLoading();
          fetch(jsonUrl).then((r) => r.json()).then((json) => {
            state.fetchingJson = false;
            state.onFinishLoading(json);
            this.graphData(json);
          });
        }
      },
      triggerUpdate: false
    },
    graphData: {
      default: {
        nodes: [],
        links: []
      },
      onChange(graphData, state) {
        state.engineRunning = false;
      }
    },
    numDimensions: {
      default: 3,
      onChange(numDim, state) {
        const chargeForce = state.d3ForceLayout.force("charge");
        if (chargeForce) {
          chargeForce.strength(numDim > 2 ? -60 : -30);
        }
        if (numDim < 3) {
          eraseDimension(state.graphData.nodes, "z");
        }
        if (numDim < 2) {
          eraseDimension(state.graphData.nodes, "y");
        }
        function eraseDimension(nodes, dim) {
          nodes.forEach((d) => {
            delete d[dim];
            delete d[`v${dim}`];
          });
        }
      }
    },
    dagMode: {
      onChange(dagMode, state) {
        !dagMode && state.forceEngine === "d3" && (state.graphData.nodes || []).forEach((n) => n.fx = n.fy = n.fz = void 0);
      }
    },
    dagLevelDistance: {},
    dagNodeFilter: {
      default: (node) => true
    },
    onDagError: {
      triggerUpdate: false
    },
    nodeRelSize: {
      default: 4
    },
    // volume per val unit
    nodeId: {
      default: "id"
    },
    nodeVal: {
      default: "val"
    },
    nodeResolution: {
      default: 8
    },
    // how many slice segments in the sphere's circumference
    nodeColor: {
      default: "color"
    },
    nodeAutoColorBy: {},
    nodeOpacity: {
      default: 0.75
    },
    nodeVisibility: {
      default: true
    },
    nodeThreeObject: {},
    nodeThreeObjectExtend: {
      default: false
    },
    nodePositionUpdate: {
      triggerUpdate: false
    },
    // custom function to call for updating the node's position. Signature: (threeObj, { x, y, z}, node). If the function returns a truthy value, the regular node position update will not run.
    linkSource: {
      default: "source"
    },
    linkTarget: {
      default: "target"
    },
    linkVisibility: {
      default: true
    },
    linkColor: {
      default: "color"
    },
    linkAutoColorBy: {},
    linkOpacity: {
      default: 0.2
    },
    linkWidth: {},
    // Rounded to nearest decimal. For falsy values use dimensionless line with 1px regardless of distance.
    linkResolution: {
      default: 6
    },
    // how many radial segments in each line tube's geometry
    linkCurvature: {
      default: 0,
      triggerUpdate: false
    },
    // line curvature radius (0: straight, 1: semi-circle)
    linkCurveRotation: {
      default: 0,
      triggerUpdate: false
    },
    // line curve rotation along the line axis (0: interection with XY plane, PI: upside down)
    linkMaterial: {},
    linkThreeObject: {},
    linkThreeObjectExtend: {
      default: false
    },
    linkPositionUpdate: {
      triggerUpdate: false
    },
    // custom function to call for updating the link's position. Signature: (threeObj, { start: { x, y, z},  end: { x, y, z }}, link). If the function returns a truthy value, the regular link position update will not run.
    linkDirectionalArrowLength: {
      default: 0
    },
    linkDirectionalArrowColor: {},
    linkDirectionalArrowRelPos: {
      default: 0.5,
      triggerUpdate: false
    },
    // value between 0<>1 indicating the relative pos along the (exposed) line
    linkDirectionalArrowResolution: {
      default: 8
    },
    // how many slice segments in the arrow's conic circumference
    linkDirectionalParticles: {
      default: 0
    },
    // animate photons travelling in the link direction
    linkDirectionalParticleSpeed: {
      default: 0.01,
      triggerUpdate: false
    },
    // in link length ratio per frame
    linkDirectionalParticleOffset: {
      default: 0,
      triggerUpdate: false
    },
    // starting position offset along the link's length, like a pre-delay. Values between [0, 1]
    linkDirectionalParticleWidth: {
      default: 0.5
    },
    linkDirectionalParticleColor: {},
    linkDirectionalParticleResolution: {
      default: 4
    },
    // how many slice segments in the particle sphere's circumference
    linkDirectionalParticleThreeObject: {},
    forceEngine: {
      default: "d3"
    },
    // d3 or ngraph
    d3AlphaMin: {
      default: 0
    },
    d3AlphaDecay: {
      default: 0.0228,
      triggerUpdate: false,
      onChange(alphaDecay, state) {
        state.d3ForceLayout.alphaDecay(alphaDecay);
      }
    },
    d3AlphaTarget: {
      default: 0,
      triggerUpdate: false,
      onChange(alphaTarget, state) {
        state.d3ForceLayout.alphaTarget(alphaTarget);
      }
    },
    d3VelocityDecay: {
      default: 0.4,
      triggerUpdate: false,
      onChange(velocityDecay, state) {
        state.d3ForceLayout.velocityDecay(velocityDecay);
      }
    },
    ngraphPhysics: {
      default: {
        // defaults from https://github.com/anvaka/ngraph.physics.simulator/blob/master/index.js
        timeStep: 20,
        gravity: -1.2,
        theta: 0.8,
        springLength: 30,
        springCoefficient: 8e-4,
        dragCoefficient: 0.02
      }
    },
    warmupTicks: {
      default: 0,
      triggerUpdate: false
    },
    // how many times to tick the force engine at init before starting to render
    cooldownTicks: {
      default: Infinity,
      triggerUpdate: false
    },
    cooldownTime: {
      default: 15e3,
      triggerUpdate: false
    },
    // ms
    onLoading: {
      default: () => {
      },
      triggerUpdate: false
    },
    onFinishLoading: {
      default: () => {
      },
      triggerUpdate: false
    },
    onUpdate: {
      default: () => {
      },
      triggerUpdate: false
    },
    onFinishUpdate: {
      default: () => {
      },
      triggerUpdate: false
    },
    onEngineTick: {
      default: () => {
      },
      triggerUpdate: false
    },
    onEngineStop: {
      default: () => {
      },
      triggerUpdate: false
    }
  },
  methods: {
    refresh: function(state) {
      state._flushObjects = true;
      state._rerender();
      return this;
    },
    // Expose d3 forces for external manipulation
    d3Force: function(state, forceName, forceFn) {
      if (forceFn === void 0) {
        return state.d3ForceLayout.force(forceName);
      }
      state.d3ForceLayout.force(forceName, forceFn);
      return this;
    },
    d3ReheatSimulation: function(state) {
      state.d3ForceLayout.alpha(1);
      this.resetCountdown();
      return this;
    },
    // reset cooldown state
    resetCountdown: function(state) {
      state.cntTicks = 0;
      state.startTickTime = /* @__PURE__ */ new Date();
      state.engineRunning = true;
      return this;
    },
    tickFrame: function(state) {
      const isD3Sim = state.forceEngine !== "ngraph";
      if (state.engineRunning && state.layout) {
        layoutTick();
      }
      updateArrows();
      updatePhotons();
      return this;
      function layoutTick() {
        if (++state.cntTicks > state.cooldownTicks || /* @__PURE__ */ new Date() - state.startTickTime > state.cooldownTime || isD3Sim && state.d3AlphaMin > 0 && state.d3ForceLayout.alpha() < state.d3AlphaMin) {
          state.engineRunning = false;
          state.onEngineStop();
        } else {
          state.layout[isD3Sim ? "tick" : "step"]();
          state.onEngineTick();
        }
        const nodeThreeObjectExtendAccessor = index3(state.nodeThreeObjectExtend);
        state.nodeDataMapper.entries().forEach(([node, obj]) => {
          if (!obj) return;
          const pos = isD3Sim ? node : state.layout.getNodePosition(node[state.nodeId]);
          const extendedObj = nodeThreeObjectExtendAccessor(node);
          if (!state.nodePositionUpdate || !state.nodePositionUpdate(extendedObj ? obj.children[0] : obj, {
            x: pos.x,
            y: pos.y,
            z: pos.z
          }, node) || extendedObj) {
            obj.position.x = pos.x;
            obj.position.y = pos.y || 0;
            obj.position.z = pos.z || 0;
          }
        });
        const linkWidthAccessor = index3(state.linkWidth);
        const linkCurvatureAccessor = index3(state.linkCurvature);
        const linkCurveRotationAccessor = index3(state.linkCurveRotation);
        const linkThreeObjectExtendAccessor = index3(state.linkThreeObjectExtend);
        state.linkDataMapper.entries().forEach(([link, lineObj]) => {
          if (!lineObj) return;
          const pos = isD3Sim ? link : state.layout.getLinkPosition(state.layout.graph.getLink(link.source, link.target).id);
          const start = pos[isD3Sim ? "source" : "from"];
          const end = pos[isD3Sim ? "target" : "to"];
          if (!start || !end || !start.hasOwnProperty("x") || !end.hasOwnProperty("x")) return;
          calcLinkCurve(link);
          const extendedObj = linkThreeObjectExtendAccessor(link);
          if (state.linkPositionUpdate && state.linkPositionUpdate(
            extendedObj ? lineObj.children[1] : lineObj,
            // pass child custom object if extending the default
            {
              start: {
                x: start.x,
                y: start.y,
                z: start.z
              },
              end: {
                x: end.x,
                y: end.y,
                z: end.z
              }
            },
            link
          ) && !extendedObj) {
            return;
          }
          const curveResolution = 30;
          const curve = link.__curve;
          const line = lineObj.children.length ? lineObj.children[0] : lineObj;
          if (line.type === "Line") {
            if (!curve) {
              let linePos = line.geometry.getAttribute("position");
              if (!linePos || !linePos.array || linePos.array.length !== 6) {
                line.geometry[setAttributeFn]("position", linePos = new three$1.BufferAttribute(new Float32Array(2 * 3), 3));
              }
              linePos.array[0] = start.x;
              linePos.array[1] = start.y || 0;
              linePos.array[2] = start.z || 0;
              linePos.array[3] = end.x;
              linePos.array[4] = end.y || 0;
              linePos.array[5] = end.z || 0;
              linePos.needsUpdate = true;
            } else {
              const curvePnts = curve.getPoints(curveResolution);
              if (line.geometry.getAttribute("position").array.length !== curvePnts.length * 3) {
                line.geometry[setAttributeFn]("position", new three$1.BufferAttribute(new Float32Array(curvePnts.length * 3), 3));
              }
              line.geometry.setFromPoints(curvePnts);
            }
            line.geometry.computeBoundingSphere();
          } else if (line.type === "Mesh") {
            if (!curve) {
              if (!line.geometry.type.match(/^Cylinder(Buffer)?Geometry$/)) {
                const linkWidth = Math.ceil(linkWidthAccessor(link) * 10) / 10;
                const r = linkWidth / 2;
                const geometry = new three$1.CylinderGeometry(r, r, 1, state.linkResolution, 1, false);
                geometry[applyMatrix4Fn](new three$1.Matrix4().makeTranslation(0, 1 / 2, 0));
                geometry[applyMatrix4Fn](new three$1.Matrix4().makeRotationX(Math.PI / 2));
                line.geometry.dispose();
                line.geometry = geometry;
              }
              const vStart = new three$1.Vector3(start.x, start.y || 0, start.z || 0);
              const vEnd = new three$1.Vector3(end.x, end.y || 0, end.z || 0);
              const distance2 = vStart.distanceTo(vEnd);
              line.position.x = vStart.x;
              line.position.y = vStart.y;
              line.position.z = vStart.z;
              line.scale.z = distance2;
              line.parent.localToWorld(vEnd);
              line.lookAt(vEnd);
            } else {
              if (!line.geometry.type.match(/^Tube(Buffer)?Geometry$/)) {
                line.position.set(0, 0, 0);
                line.rotation.set(0, 0, 0);
                line.scale.set(1, 1, 1);
              }
              const linkWidth = Math.ceil(linkWidthAccessor(link) * 10) / 10;
              const r = linkWidth / 2;
              const geometry = new three$1.TubeGeometry(curve, curveResolution, r, state.linkResolution, false);
              line.geometry.dispose();
              line.geometry = geometry;
            }
          }
        });
        function calcLinkCurve(link) {
          const pos = isD3Sim ? link : state.layout.getLinkPosition(state.layout.graph.getLink(link.source, link.target).id);
          const start = pos[isD3Sim ? "source" : "from"];
          const end = pos[isD3Sim ? "target" : "to"];
          if (!start || !end || !start.hasOwnProperty("x") || !end.hasOwnProperty("x")) return;
          const curvature = linkCurvatureAccessor(link);
          if (!curvature) {
            link.__curve = null;
          } else {
            const vStart = new three$1.Vector3(start.x, start.y || 0, start.z || 0);
            const vEnd = new three$1.Vector3(end.x, end.y || 0, end.z || 0);
            const l = vStart.distanceTo(vEnd);
            let curve;
            const curveRotation = linkCurveRotationAccessor(link);
            if (l > 0) {
              const dx = end.x - start.x;
              const dy = end.y - start.y || 0;
              const vLine = new three$1.Vector3().subVectors(vEnd, vStart);
              const cp = vLine.clone().multiplyScalar(curvature).cross(dx !== 0 || dy !== 0 ? new three$1.Vector3(0, 0, 1) : new three$1.Vector3(0, 1, 0)).applyAxisAngle(vLine.normalize(), curveRotation).add(new three$1.Vector3().addVectors(vStart, vEnd).divideScalar(2));
              curve = new three$1.QuadraticBezierCurve3(vStart, cp, vEnd);
            } else {
              const d = curvature * 70;
              const endAngle = -curveRotation;
              const startAngle = endAngle + Math.PI / 2;
              curve = new three$1.CubicBezierCurve3(vStart, new three$1.Vector3(d * Math.cos(startAngle), d * Math.sin(startAngle), 0).add(vStart), new three$1.Vector3(d * Math.cos(endAngle), d * Math.sin(endAngle), 0).add(vStart), vEnd);
            }
            link.__curve = curve;
          }
        }
      }
      function updateArrows() {
        const arrowRelPosAccessor = index3(state.linkDirectionalArrowRelPos);
        const arrowLengthAccessor = index3(state.linkDirectionalArrowLength);
        const nodeValAccessor = index3(state.nodeVal);
        state.arrowDataMapper.entries().forEach(([link, arrowObj]) => {
          if (!arrowObj) return;
          const pos = isD3Sim ? link : state.layout.getLinkPosition(state.layout.graph.getLink(link.source, link.target).id);
          const start = pos[isD3Sim ? "source" : "from"];
          const end = pos[isD3Sim ? "target" : "to"];
          if (!start || !end || !start.hasOwnProperty("x") || !end.hasOwnProperty("x")) return;
          const startR = Math.cbrt(Math.max(0, nodeValAccessor(start) || 1)) * state.nodeRelSize;
          const endR = Math.cbrt(Math.max(0, nodeValAccessor(end) || 1)) * state.nodeRelSize;
          const arrowLength = arrowLengthAccessor(link);
          const arrowRelPos = arrowRelPosAccessor(link);
          const getPosAlongLine = link.__curve ? (t) => link.__curve.getPoint(t) : (t) => {
            const iplt = (dim, start2, end2, t4) => start2[dim] + (end2[dim] - start2[dim]) * t4 || 0;
            return {
              x: iplt("x", start, end, t),
              y: iplt("y", start, end, t),
              z: iplt("z", start, end, t)
            };
          };
          const lineLen = link.__curve ? link.__curve.getLength() : Math.sqrt(["x", "y", "z"].map((dim) => Math.pow((end[dim] || 0) - (start[dim] || 0), 2)).reduce((acc, v) => acc + v, 0));
          const posAlongLine = startR + arrowLength + (lineLen - startR - endR - arrowLength) * arrowRelPos;
          const arrowHead = getPosAlongLine(posAlongLine / lineLen);
          const arrowTail = getPosAlongLine((posAlongLine - arrowLength) / lineLen);
          ["x", "y", "z"].forEach((dim) => arrowObj.position[dim] = arrowTail[dim]);
          const headVec = new three$1.Vector3(...["x", "y", "z"].map((c3) => arrowHead[c3]));
          arrowObj.parent.localToWorld(headVec);
          arrowObj.lookAt(headVec);
        });
      }
      function updatePhotons() {
        const particleSpeedAccessor = index3(state.linkDirectionalParticleSpeed);
        const particleOffsetAccessor = index3(state.linkDirectionalParticleOffset);
        state.graphData.links.forEach((link) => {
          const photonsObj = state.particlesDataMapper.getObj(link);
          const cyclePhotons = photonsObj && photonsObj.children;
          const singleHopPhotons = link.__singleHopPhotonsObj && link.__singleHopPhotonsObj.children;
          if ((!singleHopPhotons || !singleHopPhotons.length) && (!cyclePhotons || !cyclePhotons.length)) return;
          const pos = isD3Sim ? link : state.layout.getLinkPosition(state.layout.graph.getLink(link.source, link.target).id);
          const start = pos[isD3Sim ? "source" : "from"];
          const end = pos[isD3Sim ? "target" : "to"];
          if (!start || !end || !start.hasOwnProperty("x") || !end.hasOwnProperty("x")) return;
          const particleSpeed = particleSpeedAccessor(link);
          const particleOffset = Math.abs(particleOffsetAccessor(link));
          const getPhotonPos = link.__curve ? (t) => link.__curve.getPoint(t) : (t) => {
            const iplt = (dim, start2, end2, t4) => start2[dim] + (end2[dim] - start2[dim]) * t4 || 0;
            return {
              x: iplt("x", start, end, t),
              y: iplt("y", start, end, t),
              z: iplt("z", start, end, t)
            };
          };
          const photons = [...cyclePhotons || [], ...singleHopPhotons || []];
          photons.forEach((photon, idx) => {
            const singleHop = photon.parent.__linkThreeObjType === "singleHopPhotons";
            if (!photon.hasOwnProperty("__progressRatio")) {
              photon.__progressRatio = singleHop ? particleSpeed < 0 ? 1 : 0 : (idx + particleOffset) / cyclePhotons.length;
            }
            photon.__progressRatio += particleSpeed;
            if (photon.__progressRatio >= 1 || photon.__progressRatio < 0) {
              if (!singleHop) {
                photon.__progressRatio = photon.__progressRatio % 1;
                photon.__progressRatio < 0 && photon.__progressRatio++;
              } else {
                photon.parent.remove(photon);
                emptyObject(photon);
                return;
              }
            }
            const photonPosRatio = photon.__progressRatio;
            const pos2 = getPhotonPos(photonPosRatio);
            photon.geometry.type !== "SphereGeometry" && photon.lookAt(pos2.x, pos2.y, pos2.z);
            ["x", "y", "z"].forEach((dim) => photon.position[dim] = pos2[dim]);
          });
        });
      }
    },
    emitParticle: function(state, link) {
      if (link && state.graphData.links.includes(link)) {
        if (!link.__singleHopPhotonsObj) {
          const obj = new three$1.Group();
          obj.__linkThreeObjType = "singleHopPhotons";
          link.__singleHopPhotonsObj = obj;
          state.graphScene.add(obj);
        }
        let particleObj = index3(state.linkDirectionalParticleThreeObject)(link);
        if (particleObj && state.linkDirectionalParticleThreeObject === particleObj) {
          particleObj = particleObj.clone();
        }
        if (!particleObj) {
          const particleWidthAccessor = index3(state.linkDirectionalParticleWidth);
          const photonR = Math.ceil(particleWidthAccessor(link) * 10) / 10 / 2;
          const numSegments = state.linkDirectionalParticleResolution;
          const particleGeometry = new three$1.SphereGeometry(photonR, numSegments, numSegments);
          const linkColorAccessor = index3(state.linkColor);
          const particleColorAccessor = index3(state.linkDirectionalParticleColor);
          const photonColor = particleColorAccessor(link) || linkColorAccessor(link) || "#f0f0f0";
          const materialColor = new three$1.Color(colorStr2Hex(photonColor));
          const opacity = state.linkOpacity * 3;
          const particleMaterial = new three$1.MeshLambertMaterial({
            color: materialColor,
            transparent: true,
            opacity
          });
          particleObj = new three$1.Mesh(particleGeometry, particleMaterial);
        }
        link.__singleHopPhotonsObj.add(particleObj);
      }
      return this;
    },
    getGraphBbox: function(state, nodeFilter = () => true) {
      if (!state.initialised) return null;
      const bboxes = (function getBboxes(obj) {
        const bboxes2 = [];
        if (obj.geometry) {
          obj.geometry.computeBoundingBox();
          const box = new three$1.Box3();
          box.copy(obj.geometry.boundingBox).applyMatrix4(obj.matrixWorld);
          bboxes2.push(box);
        }
        return bboxes2.concat(...(obj.children || []).filter(
          (obj2) => !obj2.hasOwnProperty("__graphObjType") || obj2.__graphObjType === "node" && nodeFilter(obj2.__data)
          // exclude filtered out nodes
        ).map(getBboxes));
      })(state.graphScene);
      if (!bboxes.length) return null;
      return Object.assign(...["x", "y", "z"].map((c3) => ({
        [c3]: [min(bboxes, (bb) => bb.min[c3]), max(bboxes, (bb) => bb.max[c3])]
      })));
    }
  },
  stateInit: () => ({
    d3ForceLayout: simulation_default().force("link", link_default()).force("charge", manyBody_default()).force("center", center_default()).force("dagRadial", null).stop(),
    engineRunning: false
  }),
  init(threeObj, state) {
    state.graphScene = threeObj;
    state.nodeDataMapper = new ThreeDigest(threeObj, {
      objBindAttr: "__threeObj"
    });
    state.linkDataMapper = new ThreeDigest(threeObj, {
      objBindAttr: "__lineObj"
    });
    state.arrowDataMapper = new ThreeDigest(threeObj, {
      objBindAttr: "__arrowObj"
    });
    state.particlesDataMapper = new ThreeDigest(threeObj, {
      objBindAttr: "__photonsObj"
    });
  },
  update(state, changedProps) {
    const hasAnyPropChanged = (propList) => propList.some((p) => changedProps.hasOwnProperty(p));
    state.engineRunning = false;
    typeof state.onUpdate === "function" && state.onUpdate();
    if (state.nodeAutoColorBy !== null && hasAnyPropChanged(["nodeAutoColorBy", "graphData", "nodeColor"])) {
      autoColorObjects(state.graphData.nodes, index3(state.nodeAutoColorBy), state.nodeColor);
    }
    if (state.linkAutoColorBy !== null && hasAnyPropChanged(["linkAutoColorBy", "graphData", "linkColor"])) {
      autoColorObjects(state.graphData.links, index3(state.linkAutoColorBy), state.linkColor);
    }
    if (state._flushObjects || hasAnyPropChanged(["graphData", "nodeThreeObject", "nodeThreeObjectExtend", "nodeVal", "nodeColor", "nodeVisibility", "nodeRelSize", "nodeResolution", "nodeOpacity"])) {
      const customObjectAccessor = index3(state.nodeThreeObject);
      const customObjectExtendAccessor = index3(state.nodeThreeObjectExtend);
      const valAccessor = index3(state.nodeVal);
      const colorAccessor = index3(state.nodeColor);
      const visibilityAccessor = index3(state.nodeVisibility);
      const sphereGeometries = {};
      const sphereMaterials = {};
      if (state._flushObjects || hasAnyPropChanged([
        // recreate objects if any of these props have changed
        "nodeThreeObject",
        "nodeThreeObjectExtend"
      ])) state.nodeDataMapper.clear();
      state.nodeDataMapper.onCreateObj((node) => {
        let customObj = customObjectAccessor(node);
        const extendObj = customObjectExtendAccessor(node);
        if (customObj && state.nodeThreeObject === customObj) {
          customObj = customObj.clone();
        }
        let obj;
        if (customObj && !extendObj) {
          obj = customObj;
        } else {
          obj = new three$1.Mesh();
          obj.__graphDefaultObj = true;
          if (customObj && extendObj) {
            obj.add(customObj);
          }
        }
        obj.__graphObjType = "node";
        return obj;
      }).onUpdateObj((obj, node) => {
        if (obj.__graphDefaultObj) {
          const val = valAccessor(node) || 1;
          const radius = Math.cbrt(val) * state.nodeRelSize;
          const numSegments = state.nodeResolution;
          if (!obj.geometry.type.match(/^Sphere(Buffer)?Geometry$/) || obj.geometry.parameters.radius !== radius || obj.geometry.parameters.widthSegments !== numSegments) {
            if (!sphereGeometries.hasOwnProperty(val)) {
              sphereGeometries[val] = new three$1.SphereGeometry(radius, numSegments, numSegments);
            }
            obj.geometry.dispose();
            obj.geometry = sphereGeometries[val];
          }
          const color2 = colorAccessor(node);
          const materialColor = new three$1.Color(colorStr2Hex(color2 || "#ffffaa"));
          const opacity = state.nodeOpacity * colorAlpha(color2);
          if (obj.material.type !== "MeshLambertMaterial" || !obj.material.color.equals(materialColor) || obj.material.opacity !== opacity) {
            if (!sphereMaterials.hasOwnProperty(color2)) {
              sphereMaterials[color2] = new three$1.MeshLambertMaterial({
                color: materialColor,
                transparent: true,
                opacity
              });
            }
            obj.material.dispose();
            obj.material = sphereMaterials[color2];
          }
        }
      }).digest(state.graphData.nodes.filter(visibilityAccessor));
    }
    if (state._flushObjects || hasAnyPropChanged(["graphData", "linkThreeObject", "linkThreeObjectExtend", "linkMaterial", "linkColor", "linkWidth", "linkVisibility", "linkResolution", "linkOpacity", "linkDirectionalArrowLength", "linkDirectionalArrowColor", "linkDirectionalArrowResolution", "linkDirectionalParticles", "linkDirectionalParticleWidth", "linkDirectionalParticleColor", "linkDirectionalParticleResolution", "linkDirectionalParticleThreeObject"])) {
      const customObjectAccessor = index3(state.linkThreeObject);
      const customObjectExtendAccessor = index3(state.linkThreeObjectExtend);
      const customMaterialAccessor = index3(state.linkMaterial);
      const visibilityAccessor = index3(state.linkVisibility);
      const colorAccessor = index3(state.linkColor);
      const widthAccessor = index3(state.linkWidth);
      const cylinderGeometries = {};
      const lambertLineMaterials = {};
      const basicLineMaterials = {};
      const visibleLinks = state.graphData.links.filter(visibilityAccessor);
      if (state._flushObjects || hasAnyPropChanged([
        // recreate objects if any of these props have changed
        "linkThreeObject",
        "linkThreeObjectExtend",
        "linkWidth"
      ])) state.linkDataMapper.clear();
      state.linkDataMapper.onRemoveObj((obj) => {
        const singlePhotonsObj = obj.__data && obj.__data.__singleHopPhotonsObj;
        if (singlePhotonsObj) {
          singlePhotonsObj.parent.remove(singlePhotonsObj);
          emptyObject(singlePhotonsObj);
          delete obj.__data.__singleHopPhotonsObj;
        }
      }).onCreateObj((link) => {
        let customObj = customObjectAccessor(link);
        const extendObj = customObjectExtendAccessor(link);
        if (customObj && state.linkThreeObject === customObj) {
          customObj = customObj.clone();
        }
        let defaultObj;
        if (!customObj || extendObj) {
          const useCylinder = !!widthAccessor(link);
          if (useCylinder) {
            defaultObj = new three$1.Mesh();
          } else {
            const lineGeometry = new three$1.BufferGeometry();
            lineGeometry[setAttributeFn]("position", new three$1.BufferAttribute(new Float32Array(2 * 3), 3));
            defaultObj = new three$1.Line(lineGeometry);
          }
        }
        let obj;
        if (!customObj) {
          obj = defaultObj;
          obj.__graphDefaultObj = true;
        } else {
          if (!extendObj) {
            obj = customObj;
          } else {
            obj = new three$1.Group();
            obj.__graphDefaultObj = true;
            obj.add(defaultObj);
            obj.add(customObj);
          }
        }
        obj.renderOrder = 10;
        obj.__graphObjType = "link";
        return obj;
      }).onUpdateObj((updObj, link) => {
        if (updObj.__graphDefaultObj) {
          const obj = updObj.children.length ? updObj.children[0] : updObj;
          const linkWidth = Math.ceil(widthAccessor(link) * 10) / 10;
          const useCylinder = !!linkWidth;
          if (useCylinder) {
            const r = linkWidth / 2;
            const numSegments = state.linkResolution;
            if (!obj.geometry.type.match(/^Cylinder(Buffer)?Geometry$/) || obj.geometry.parameters.radiusTop !== r || obj.geometry.parameters.radialSegments !== numSegments) {
              if (!cylinderGeometries.hasOwnProperty(linkWidth)) {
                const geometry = new three$1.CylinderGeometry(r, r, 1, numSegments, 1, false);
                geometry[applyMatrix4Fn](new three$1.Matrix4().makeTranslation(0, 1 / 2, 0));
                geometry[applyMatrix4Fn](new three$1.Matrix4().makeRotationX(Math.PI / 2));
                cylinderGeometries[linkWidth] = geometry;
              }
              obj.geometry.dispose();
              obj.geometry = cylinderGeometries[linkWidth];
            }
          }
          const customMaterial = customMaterialAccessor(link);
          if (customMaterial) {
            obj.material = customMaterial;
          } else {
            const color2 = colorAccessor(link);
            const materialColor = new three$1.Color(colorStr2Hex(color2 || "#f0f0f0"));
            const opacity = state.linkOpacity * colorAlpha(color2);
            const materialType = useCylinder ? "MeshLambertMaterial" : "LineBasicMaterial";
            if (obj.material.type !== materialType || !obj.material.color.equals(materialColor) || obj.material.opacity !== opacity) {
              const lineMaterials = useCylinder ? lambertLineMaterials : basicLineMaterials;
              if (!lineMaterials.hasOwnProperty(color2)) {
                lineMaterials[color2] = new three$1[materialType]({
                  color: materialColor,
                  transparent: opacity < 1,
                  opacity,
                  depthWrite: opacity >= 1
                  // Prevent transparency issues
                });
              }
              obj.material.dispose();
              obj.material = lineMaterials[color2];
            }
          }
        }
      }).digest(visibleLinks);
      if (state.linkDirectionalArrowLength || changedProps.hasOwnProperty("linkDirectionalArrowLength")) {
        const arrowLengthAccessor = index3(state.linkDirectionalArrowLength);
        const arrowColorAccessor = index3(state.linkDirectionalArrowColor);
        state.arrowDataMapper.onCreateObj(() => {
          const obj = new three$1.Mesh(void 0, new three$1.MeshLambertMaterial({
            transparent: true
          }));
          obj.__linkThreeObjType = "arrow";
          return obj;
        }).onUpdateObj((obj, link) => {
          const arrowLength = arrowLengthAccessor(link);
          const numSegments = state.linkDirectionalArrowResolution;
          if (!obj.geometry.type.match(/^Cone(Buffer)?Geometry$/) || obj.geometry.parameters.height !== arrowLength || obj.geometry.parameters.radialSegments !== numSegments) {
            const coneGeometry = new three$1.ConeGeometry(arrowLength * 0.25, arrowLength, numSegments);
            coneGeometry.translate(0, arrowLength / 2, 0);
            coneGeometry.rotateX(Math.PI / 2);
            obj.geometry.dispose();
            obj.geometry = coneGeometry;
          }
          const arrowColor = arrowColorAccessor(link) || colorAccessor(link) || "#f0f0f0";
          obj.material.color = new three$1.Color(colorStr2Hex(arrowColor));
          obj.material.opacity = state.linkOpacity * 3 * colorAlpha(arrowColor);
        }).digest(visibleLinks.filter(arrowLengthAccessor));
      }
      if (state.linkDirectionalParticles || changedProps.hasOwnProperty("linkDirectionalParticles")) {
        const particlesAccessor = index3(state.linkDirectionalParticles);
        const particleWidthAccessor = index3(state.linkDirectionalParticleWidth);
        const particleColorAccessor = index3(state.linkDirectionalParticleColor);
        const particleObjectAccessor = index3(state.linkDirectionalParticleThreeObject);
        const particleMaterials = {};
        const particleGeometries = {};
        state.particlesDataMapper.onCreateObj(() => {
          const obj = new three$1.Group();
          obj.__linkThreeObjType = "photons";
          obj.__photonDataMapper = new ThreeDigest(obj);
          return obj;
        }).onUpdateObj((obj, link) => {
          const curPhoton = !!obj.children.length && obj.children[0];
          const customObj = particleObjectAccessor(link);
          let particleGeometry, particleMaterial;
          if (customObj) {
            particleGeometry = customObj.geometry;
            particleMaterial = customObj.material;
          } else {
            const photonR = Math.ceil(particleWidthAccessor(link) * 10) / 10 / 2;
            const numSegments = state.linkDirectionalParticleResolution;
            if (curPhoton && curPhoton.geometry.parameters.radius === photonR && curPhoton.geometry.parameters.widthSegments === numSegments) {
              particleGeometry = curPhoton.geometry;
            } else {
              if (!particleGeometries.hasOwnProperty(photonR)) {
                particleGeometries[photonR] = new three$1.SphereGeometry(photonR, numSegments, numSegments);
              }
              particleGeometry = particleGeometries[photonR];
            }
            const photonColor = particleColorAccessor(link) || colorAccessor(link) || "#f0f0f0";
            const materialColor = new three$1.Color(colorStr2Hex(photonColor));
            const opacity = state.linkOpacity * 3;
            if (curPhoton && curPhoton.material.color.equals(materialColor) && curPhoton.material.opacity === opacity) {
              particleMaterial = curPhoton.material;
            } else {
              if (!particleMaterials.hasOwnProperty(photonColor)) {
                particleMaterials[photonColor] = new three$1.MeshLambertMaterial({
                  color: materialColor,
                  transparent: true,
                  opacity
                });
              }
              particleMaterial = particleMaterials[photonColor];
            }
          }
          if (curPhoton) {
            curPhoton.geometry !== particleGeometry && curPhoton.geometry.dispose();
            curPhoton.material !== particleMaterial && curPhoton.material.dispose();
          }
          const numPhotons = Math.round(Math.abs(particlesAccessor(link)));
          obj.__photonDataMapper.id((d) => d.idx).onCreateObj(() => new three$1.Mesh(particleGeometry, particleMaterial)).onUpdateObj((obj2) => {
            obj2.geometry = particleGeometry;
            obj2.material = particleMaterial;
          }).digest([...new Array(numPhotons)].map((_, idx) => ({
            idx
          })));
        }).digest(visibleLinks.filter(particlesAccessor));
      }
    }
    state._flushObjects = false;
    if (hasAnyPropChanged(["graphData", "nodeId", "linkSource", "linkTarget", "numDimensions", "forceEngine", "dagMode", "dagNodeFilter", "dagLevelDistance"])) {
      state.engineRunning = false;
      state.graphData.links.forEach((link) => {
        link.source = link[state.linkSource];
        link.target = link[state.linkTarget];
      });
      const isD3Sim = state.forceEngine !== "ngraph";
      let layout;
      if (isD3Sim) {
        (layout = state.d3ForceLayout).stop().alpha(1).numDimensions(state.numDimensions).nodes(state.graphData.nodes);
        const linkForce = state.d3ForceLayout.force("link");
        if (linkForce) {
          linkForce.id((d) => d[state.nodeId]).links(state.graphData.links);
        }
        const nodeDepths = state.dagMode && getDagDepths(state.graphData, (node) => node[state.nodeId], {
          nodeFilter: state.dagNodeFilter,
          onLoopError: state.onDagError || void 0
        });
        const maxDepth = Math.max(...Object.values(nodeDepths || []));
        const dagLevelDistance = state.dagLevelDistance || state.graphData.nodes.length / (maxDepth || 1) * DAG_LEVEL_NODE_RATIO * (["radialin", "radialout"].indexOf(state.dagMode) !== -1 ? 0.7 : 1);
        if (["lr", "rl", "td", "bu", "zin", "zout"].includes(changedProps.dagMode)) {
          const resetProp = ["lr", "rl"].includes(changedProps.dagMode) ? "fx" : ["td", "bu"].includes(changedProps.dagMode) ? "fy" : "fz";
          state.graphData.nodes.filter(state.dagNodeFilter).forEach((node) => delete node[resetProp]);
        }
        if (["lr", "rl", "td", "bu", "zin", "zout"].includes(state.dagMode)) {
          const invert = ["rl", "td", "zout"].includes(state.dagMode);
          const fixFn = (node) => (nodeDepths[node[state.nodeId]] - maxDepth / 2) * dagLevelDistance * (invert ? -1 : 1);
          const resetProp = ["lr", "rl"].includes(state.dagMode) ? "fx" : ["td", "bu"].includes(state.dagMode) ? "fy" : "fz";
          state.graphData.nodes.filter(state.dagNodeFilter).forEach((node) => node[resetProp] = fixFn(node));
        }
        state.d3ForceLayout.force("dagRadial", ["radialin", "radialout"].indexOf(state.dagMode) !== -1 ? radial_default((node) => {
          const nodeDepth = nodeDepths[node[state.nodeId]] || -1;
          return (state.dagMode === "radialin" ? maxDepth - nodeDepth : nodeDepth) * dagLevelDistance;
        }).strength((node) => state.dagNodeFilter(node) ? 1 : 0) : null);
      } else {
        const graph = ngraph.graph();
        state.graphData.nodes.forEach((node) => {
          graph.addNode(node[state.nodeId]);
        });
        state.graphData.links.forEach((link) => {
          graph.addLink(link.source, link.target);
        });
        layout = ngraph.forcelayout(graph, {
          dimensions: state.numDimensions,
          ...state.ngraphPhysics
        });
        layout.graph = graph;
      }
      for (let i = 0; i < state.warmupTicks && !(isD3Sim && state.d3AlphaMin > 0 && state.d3ForceLayout.alpha() < state.d3AlphaMin); i++) {
        layout[isD3Sim ? "tick" : "step"]();
      }
      state.layout = layout;
      this.resetCountdown();
    }
    state.engineRunning = true;
    state.onFinishUpdate();
  }
});
function fromKapsule(kapsule, baseClass = Object, initKapsuleWithSelf = false) {
  class ForceGraph2 extends baseClass {
    constructor(...args) {
      super(...args);
      this.__kapsuleInstance = new kapsule(...[...initKapsuleWithSelf ? [this] : [], ...args]);
    }
  }
  const dummyK = kapsule();
  dummyK._destructor?.();
  Object.keys(dummyK).forEach((m2) => ForceGraph2.prototype[m2] = function(...args) {
    const returnVal = this.__kapsuleInstance[m2](...args);
    return returnVal === this.__kapsuleInstance ? this : returnVal;
  });
  return ForceGraph2;
}
var three = window.THREE ? window.THREE : {
  Group
};
var threeForcegraph = fromKapsule(ForceGraph, three.Group, true);
export {
  threeForcegraph as default
};
