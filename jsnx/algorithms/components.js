'use strict';
goog.provide('jsnx.algorithms.components');


goog.require('goog.iter');
goog.require('goog.iter.Iterator');
goog.require('goog.structs.Set');
goog.require('goog.object');
goog.require('goog.array');

jsnx.algorithms.components.strongly_connected_components = function(G) {
    var preorder = {};
    var lowlink = {};
    var scc_found = new goog.structs.Set();
    var scc_queue = [];
    var scc_list = [];
    var i = 0;  // preorder counter
    var done = false;
    
    goog.iter.forEach(G.nodes_iter(), function(source) {
        var v, v_nbrs, w, nbr_idx, queue, scc, k;
        if (!scc_found.contains(source)) {
            queue = [source];
            while (queue.length > 0) {
                v = queue[queue.length - 1];
                if (!goog.object.containsKey(preorder, v)) {
                    i = i + 1;
                    preorder[v] = i;
                }
                done = true;
                v_nbrs = G.neighbors(v);

                for (nbr_idx = 0; nbr_idx < v_nbrs.length; nbr_idx++) {
                    w = v_nbrs[nbr_idx];
                    if (!goog.object.containsKey(preorder, w)) {
                        queue.push(w);
                        done = false;
                        break;
                    }
                }
                if (done) {
                    lowlink[v] = preorder[v];
                    for (nbr_idx = 0; nbr_idx < v_nbrs.length; nbr_idx++) {
                        w = v_nbrs[nbr_idx];
                        if (!scc_found.contains(w)) {
                            if (preorder[w] > preorder[v]) {
                                lowlink[v] = Math.min(lowlink[v], lowlink[w]);
                            } else {
                                lowlink[v] = Math.min(lowlink[v], preorder[w])
                            }
                        }
                    }
                    queue.pop();
                    if (lowlink[v] === preorder[v]) {
                        scc_found.add(v);
                        scc = [v];
                        while (scc_queue.length > 0 &&
                            preorder[goog.array.peek(scc_queue)] >
                            preorder[v]) {
                                k = scc_queue.pop()
                                scc_found.add(k);
                                scc.push(k);
                        }
                        scc_list.push(scc);
                    } else {
                        scc_queue.push(v);
                    }
                }
            }
        }
    });

    scc_list.sort(function (a, b) {
        return b.length - a.length;
    });
    return scc_list;
};
goog.exportSymbol('jsnx.strongly_connected_components', jsnx.algorithms.components.strongly_connected_components);
