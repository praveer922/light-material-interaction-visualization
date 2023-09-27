/** Class representing a Tree. */
class Tree {
  /**
   * Creates a Tree Object
   * Populates a single attribute that contains a list (array) of Node objects to be used by the other functions in this class
   * @param {json[]} json - array of json objects with name and parent fields
   */
  constructor(json) {
    let nodes = [];
    json.forEach(function(obj) {
      let node = new Node(obj.name, obj.parent);
      nodes.push(node);
    });
    this.nodes = nodes;
  }

  /**
   * Assign other required attributes for the nodes.
   */
  buildTree () {
    // note: in this function you will assign positions and levels by making calls to assignPosition() and assignLevel()
    let root_node;

    for (var i = 0; i < this.nodes.length; i++) {
      for (var j = 0; j < this.nodes.length; j++) {
        // first, set the parentNode
        if (this.nodes[j].name == this.nodes[i].parentName) {
            this.nodes[i].parentNode = this.nodes[j];
        }
        // then check for children nodes
        if (this.nodes[j].parentName == this.nodes[i].name) {
          this.nodes[i].children.push(this.nodes[j]);
        }
      }
      // store root node if we come across it
      if (this.nodes[i].parentName == "root") {
        root_node = this.nodes[i];
      }
    }

    this.assignLevel(root_node, 0);
    this.assignPosition(root_node, 0);

    console.log(this.nodes)
  
  }

  /**
   * Recursive function that assign levels to each node
   */
  assignLevel (node, level) {
    if (node.level != null) {
      // already set, so just exit.
      return;
    } else {
      // first, set the current level
        node.level = level;
      // then, recursively call the same function on each of its children
      for (var i=0;i<node.children.length;i++) {
        this.assignLevel(node.children[i], level+1);
      }
    }

  }

  /**
   * Recursive function that assign positions to each node
   */
  assignPosition (node, position) {
      node.position = position;
      if (node.children.length == 0) {
        return;
      }
      // set position of first child
      this.assignPosition(node.children[0], position)
      // set position of remaining children
      for (var i=1;i<node.children.length;i++) {
        this.assignPosition(node.children[i], this.getMaxPos(node.children[i-1]) + 1);
      }
  }

  /**  
   * Helper function that recursively counts the number of  
   * extra children underneath this node, used for determining position
  */
  getMaxPos(node) {
    var max_pos = node.position;
    for (var i=0;i<node.children.length;i++) {
      var max_pos_child = this.getMaxPos(node.children[i]);
      if (max_pos_child > max_pos) {
        max_pos = max_pos_child;
      }
    }
    return max_pos;
  }

  /**
   * Function that renders the tree
   */
  renderTree () {
    var svg_container = d3.select("body")
    .append("svg")
    .attr("width", 1200)
    .attr("height", 1200);

    for (var i=0;i<this.nodes.length;i++) {
      var x = this.nodes[i].level*240 + 50;
      var y = this.nodes[i].position*150 + 50;

      

      // add nodegroups:
      var nodegroup = svg_container.append("g")
                      .attr("class", 'nodeGroup')
                      .attr("transform", "translate(" + x +"," + y + ")");
      // add circle
      nodegroup.append("circle")
          .attr("r", 45);
      // add text
      nodegroup.append("text")
          .attr("class", "label")
          .text(this.nodes[i].name);

      // add lines for every parent
      if (this.nodes[i].parentName != "root") {
        var parent_node = this.nodes[i].parentNode;
        var parent_x = (parent_node.level)*240 + 50;
        var parent_y = parent_node.position*150 + 50;
        svg_container.append("line")
          .attr("x1", parent_x)
          .attr("y1", parent_y)
          .attr("x2", x)
          .attr("y2", y)
      }
    }

    d3.selectAll("g").raise();

  }

}