'use strict';
goog.provide('jsnx.algorithms.cycles');

goog.require('jsnx.algorithms.components');
goog.require('goog.iter');
goog.require('goog.structs.Set');
goog.require('goog.object');
goog.require('goog.array');

jsnx.algorithms.cycles.simple_cycles = function (G) {
    if (!G.is_directed()) {
        throw new jsnx.exception.JSNetworkXError(
            'simple_cycles() is not defined for undirected graphs.'
        );
    }
    
    var Ak;
    var B = {};
    var blocked = new goog.structs.Set();
    var s;
    var s_idx;
    var i;
    var j;
    var nodes = G.nodes();
    var stack = [];
    var output = [];
    var strongComps;
    var startNode;
    var minVal;
    var subgraph;
    var compNodes;
    var order = {};
    
    var circuit = function (v) {
        var f = false;
        var i;
        var w;
        var succ = Ak.successors(v);
        var tmpout;
        var unblock = function (u) {
            var w;
            blocked.remove(u);
            while (B[u].length > 0) {
                w = B[u].pop();
                if (blocked.contains(w)) {
                    unblock(w);
                }
            }
        };
        stack.push(v);
        blocked.add(v);
        for (i = 0; i < succ.length; i++) {
            w = succ[i];
            if (w === s) {
                tmpout = stack.slice(0);
                tmpout.push(s);
                output.push(tmpout);
                f = true;
            } else if (!blocked.contains(w)) {
                if (circuit(w)) {
                    f = true;
                }
            }
        }
        if (f) {
            unblock(v);
        } else {
            for (i = 0; i < succ.length; i++) {
                w = succ[i];
                if (!goog.array.contains(B[w], v)) {
                    B[w].push(v);
                }
            }
        }
        // unstack v
        if (v !== stack.pop()) {
            console.log("DANGER WILL ROBINSON!");
        }
        return f;
    };
    
    for (i = 0; i < nodes.length; i++) {
        B[nodes[i]] = [];
        order[nodes[i]] = i;
    }
    
    s_idx = 0;
    while (s_idx < nodes.length - 1) {
        s = nodes[s_idx];
        subgraph = G.subgraph(nodes.slice(s_idx));
        strongComps =
            jsnx.algorithms.components.strongly_connected_components(subgraph);
        
        if (strongComps.length === 0) {
            s_idx = nodes.length;
        } else {
            startNode = undefined;
            minVal = undefined;
            Ak = undefined;
            for (i = 0; i < strongComps.length; i++) {
                for (j = 0; j < strongComps[i].length; j++) {
                    if (startNode === undefined) {
                        startNode = strongComps[i][j];
                        Ak = strongComps[i];
                        minVal = order[startNode];
                    } else if (order[strongComps[i][j]] < minVal) {
                        startNode = strongComps[i][j];
                        Ak = strongComps[i];
                        minVal = order[startNode];
                    }
                }
            }
            Ak = G.subgraph(Ak);
            s = startNode;
            s_idx = order[startNode];
            compNodes = Ak.nodes();
            for (i = 0; i < compNodes.length; i++) {
                blocked.remove(compNodes[i]);
                B[compNodes[i]] = [];
            }
            circuit(s);
            s_idx++;
        }
    }
    return output;
};
goog.exportSymbol('jsnx.simple_cycles', jsnx.algorithms.cycles.simple_cycles);
