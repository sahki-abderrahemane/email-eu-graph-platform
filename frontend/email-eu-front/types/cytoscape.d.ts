declare module 'react-cytoscapejs' {
    import { Component } from 'react';
    import cytoscape from 'cytoscape';

    interface CytoscapeComponentProps {
        elements: cytoscape.ElementDefinition[];
        stylesheet?: cytoscape.Stylesheet[];
        layout?: cytoscape.LayoutOptions;
        cy?: (cy: cytoscape.Core) => void;
        style?: React.CSSProperties;
        className?: string;
        zoom?: number;
        pan?: cytoscape.Position;
        minZoom?: number;
        maxZoom?: number;
        zoomingEnabled?: boolean;
        userZoomingEnabled?: boolean;
        panningEnabled?: boolean;
        userPanningEnabled?: boolean;
        boxSelectionEnabled?: boolean;
        autoungrabify?: boolean;
        autounselectify?: boolean;
    }

    export default class CytoscapeComponent extends Component<CytoscapeComponentProps> { }
}

declare module 'cytoscape-cola' {
    import cytoscape from 'cytoscape';
    const cola: cytoscape.Ext;
    export = cola;
}
