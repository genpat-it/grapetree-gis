let tree_interceptor = (tree, callback) => {
    
    if (!tree) {
        console.error("tree not defined");
        return;
    }

    if (!callback || typeof callback !== 'function') {
        console.error("callback not defined");
        return;
    }

    tree.addNodesSelectedListener((tree) => {
        let groupedNodes = {};
        selectedNodeIDs = tree.getSelectedNodeIDs();
        for (selectedNodeID of selectedNodeIDs) {
            groupedNodes[selectedNodeID] = tree.grouped_nodes[selectedNodeID];
        }
        console.log(groupedNodes);
        callback(groupedNodes); 
    });
}