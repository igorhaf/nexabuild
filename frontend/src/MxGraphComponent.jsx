import React, { useRef, useEffect, useState } from 'react';
import { setText } from './redux/actions/textActions';
import { useDispatch } from 'react-redux';
import mxgraph from 'mxgraph';
import './MxGraphComponent.css';
import ifIcon from './assets/images/icons/if.svg';
import scheduleIcon from './assets/images/icons/schedule.svg';
import sleepIcon from './assets/images/icons/sleep.svg';
import startIcon from './assets/images/icons/start.svg';
import stopIcon from './assets/images/icons/stop.svg';
import switchIcon from './assets/images/icons/switch.svg';
import webhookIcon from './assets/images/icons/webhook.svg';
import exceptionIcon from './assets/images/icons/exception.svg';
import queryIcon from './assets/images/icons/query.svg';
import gmailReceiveIcon from './assets/images/icons/gmail-receive.svg';
import gmailSendIcon from './assets/images/icons/gmail-send.svg';
import trelloAddCardIcon from './assets/images/icons/trello-add-card.svg';
import trelloRemoveCardIcon from './assets/images/icons/trello-remove-card.svg';
import linkIcon from './assets/images/icons/link.svg';
import apiIcon from './assets/images/icons/api.svg';
import bashIcon from './assets/images/icons/bash.svg';
import javascriptIcon from './assets/images/icons/javascript.svg';
import { addFragment } from './redux/actions/fragmentActions';
import { addForm, removeForm } from './redux/actions/formActions';
import { getLastGraph, sendGraphApi } from './api/graphService';
var parseString = require('xml2js').parseString;

const {
  mxGraph, mxRubberband, mxKeyHandler, mxClient, mxUtils, mxEvent, mxConstants, mxCodec, mxGeometry, mxPoint
} = mxgraph();

const MxGraphComponent = () => {
  const graphContainer = useRef(null);
  const [graph, setGraph, graphData, setGraphData] = useState(null);
  const dispatch = useDispatch();

  const getIconURLFromClassName = (className) => {
    const icons = {
      'start': startIcon,
      'if': ifIcon,
      'schedule': scheduleIcon,
      'sleep': sleepIcon,
      'stop': stopIcon,
      'switch': switchIcon,
      'webhook': webhookIcon,
      'exception': exceptionIcon,
      'query': queryIcon,
      'gmail-receive': gmailReceiveIcon,
      'gmail-send': gmailSendIcon,
      'trello-add-card': trelloAddCardIcon,
      'trello-remove-card': trelloRemoveCardIcon,
      'link': linkIcon,
      'api': apiIcon,
      'javascript': javascriptIcon,
      'bash': bashIcon
    };
    return icons[className] || '';
  };

  const initGraph = (container) => {
   /* mxEvent.disableContextMenu(document.body);
    mxConstants.HANDLE_FILLCOLOR = '#99ccff';
    mxConstants.HANDLE_STROKECOLOR = '#0088cf';
    mxConstants.VERTEX_SELECTION_COLOR = '#00a8ff';*/

    const newGraph = new mxGraph(container);
    setGraph(newGraph);
    mxUtils.alert = (message) => {
      dispatch(setText("Emitindo evento de erro: " + message));
    };
    //newGraph.setTooltips(false);
    newGraph.setCellsEditable(true);
    newGraph.setConnectable(true);
    newGraph.setMultigraph(false);
    newGraph.setAllowDanglingEdges(false);
    newGraph.getModel().addListener(mxEvent.AFTER_ADD, () => {
      newGraph.refresh();
    });
      newGraph.setPanning(true);
      newGraph.panningHandler.useLeftButtonForPanning = true;
      newGraph.panningHandler.border = 0;
      newGraph.gridSize = 10;
      newGraph.scrollbars = false;
      newGraph.pageVisible = false;
      newGraph.setEnabled(true);
      newGraph.setCellsDeletable(true);
      newGraph.stylesheet.getDefaultEdgeStyle().rounded = 1;
      newGraph.stylesheet.getDefaultEdgeStyle().jettySize = 30;
      newGraph.setCellsResizable(false);
    const style = newGraph.getStylesheet().getDefaultVertexStyle();
    style[mxConstants.STYLE_EXIT_X] = 1.0;
    style[mxConstants.STYLE_EXIT_Y] = 0.5;
    style[mxConstants.STYLE_EXIT_PERIMETER] = 0;
    style[mxConstants.STYLE_ENTRY_X] = 0;
    style[mxConstants.STYLE_ENTRY_Y] = 0.5;
    style[mxConstants.STYLE_ENTRY_PERIMETER] = 0;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
    style[mxConstants.STYLE_VERTICAL_LABEL_POSITION] = 'bottom';
    style[mxConstants.STYLE_SPACING_BOTTOM] = 32; // Mova o label 32 pixels para cima
    style[mxConstants.STYLE_FONTCOLOR] = '#dee0e4';  // Branco


    newGraph.getModel().beginUpdate();
    try {
      newGraph.getStylesheet().putDefaultVertexStyle(style);

    } finally {
      newGraph.getModel().endUpdate();
    }
      new mxRubberband(newGraph);

      const keyHandler = new mxKeyHandler(newGraph);
      keyHandler.bindKey(46, (evt) => {

          if (newGraph.isEnabled()) {

              //newGraph.container.focus();
              newGraph.removeCells()
          }
      });

    return newGraph;
  };

  const drop = (event) => {
        event.preventDefault();
        const data = event.dataTransfer.getData('nodeData');
        const { iconClass, name } = JSON.parse(data);

        const parent = graph.getDefaultParent();


      graph.getModel().beginUpdate();
        try {
          const regex = /static\/media\/([^.]+)\./;
            const iconURL = getIconURLFromClassName(iconClass);
            const shapeMatch = iconURL.match(regex);
            const type = shapeMatch ? shapeMatch[1] : null;

            if (type === 'start') {
              // Verifica se já existe um vértice do tipo 'start'
              const existingVertices = graph.getChildVertices(parent);
              const startVertexExists = existingVertices.some(vertex => {
                const style = vertex.getStyle();
                const match = style && style.match(regex);
                return match && match[1] === 'start';
              });

              if (startVertexExists) {
                // Se um vértice 'start' já existe, não adiciona outro e emite um evento de erro
                dispatch(setText('Dois vertices do tipo start, não podem coexistir no maesmo frame.'));
                return; // Interrompe a execução do método
              }
            }

            const x = event.clientX;
            const y = event.clientY;

            // Convertendo as coordenadas do mouse para coordenadas do gráfico
            const point = graph.getPointForEvent(event);
            if (x !== undefined && y !== undefined) {
              graph.insertVertex(parent, null, name, point.x - 24, point.y - 24, 48, 48, `shape=image;image=${iconURL}`);
            }
        } finally {
            graph.getModel().endUpdate();
        }

    };

  const addClickEventListener = (graph) => {
    graph.addListener(mxEvent.CLICK, (sender, evt) => {
        graph.addListener(mxEvent.CLICK, (sender, evt) => {
            const cell = evt.getProperty('cell');
            if (cell && cell.value) {
              let regex = /static\/media\/([^.]+)\./;
              let nodeType = cell.style.match(regex);
              if (nodeType && nodeType.length > 1) {
                console.log(nodeType[1])
                if(nodeType[1] === 'sleep'){
                  dispatch(addForm('SleepForm'))
                }
                if(nodeType[1] === 'schedule'){
                  dispatch(addForm('ScheduleForm'))
                }
                if(nodeType[1] === 'if'){
                  dispatch(addForm('IfForm'))
                }
                if(nodeType[1] === 'link'){
                  dispatch(addForm('LinkForm'))
                }
                if(nodeType[1] === 'query'){
                  dispatch(addForm('QueryForm'))
                }


                //onNodeSelected(cell.value);
                //onNodeType(nodeType[1]);
              }
            }
        });
    });
  };
  const addConsoleEventListener = (graph) => {
    mxUtils.alert = function(message) {
      dispatch(setText("Alert from mxGraph:"+ message));
      console.log("Alert from mxGraph:", message);
    };

    graph.addListener(mxEvent.CELL_CONNECTED, async (sender, evt) => {
      const edge = evt.getProperty('edge');

      const source = graph.getModel().getTerminal(edge, true);
      const target = graph.getModel().getTerminal(edge, false);

      if (!edge || !source || !target) {
        return; // Se não for uma aresta válida ou não tiver terminais, ignora
      }

      const regex = /static\/media\/([^.]+)\./;
      const sourceMatch = source.getStyle().match(regex);
      const targetMatch = target.getStyle().match(regex);
      const sourceType = sourceMatch ? sourceMatch[1] : null;
      const targetType = targetMatch ? targetMatch[1] : null;
      if (sourceType !== 'if'){
        if (sourceType !== 'switch'){
          const edges = graph.getModel().getEdges(source);
          const outgoingEdges = edges.filter(e => e.source === source && e.target !== source);
            if (outgoingEdges.length > 1) {
              // Se "start" já tem uma aresta saindo e está tentando fazer outra, remova a nova aresta.
              graph.getModel().beginUpdate();
              try {
                dispatch(setText('O "'+sourceType+'" não pode ter mais de uma conexão saindo.'));
                target.removeEdge(edge, true);
              } finally {
                graph.getModel().endUpdate();
              }
              return;
            }
          }
        }

      if (targetType === 'start') {
        graph.getModel().beginUpdate();
        try {
          dispatch(setText("Start não pode ser o alvo de uma conexão."));
          target.removeEdge(edge, true);
        } finally {
          graph.getModel().endUpdate();
        }
        return;
      }

        if (sourceType === 'stop') {
            graph.getModel().beginUpdate();
            try {
                dispatch(setText("Stop não pode ser fonte de uma conexão."));
                target.removeEdge(edge, true);
            } finally {
                graph.getModel().endUpdate();
            }
            return;
        }

        if (sourceType === 'link') {
          graph.getModel().beginUpdate();
          try {
              dispatch(setText("Link não pode ser fonte de uma conexão."));
              target.removeEdge(edge, true);
          } finally {
              graph.getModel().endUpdate();
          }
          return;
      }

        if (sourceType === 'exception') {
            graph.getModel().beginUpdate();
            try {
                dispatch(setText("Exception não pode ser fonte de uma conexão."));
                target.removeEdge(edge, true);
            } finally {
                graph.getModel().endUpdate();
            }
            return;
        }


      // Verifica se já existe uma aresta na direção oposta
      let existingConnections = graph.getModel().getEdgesBetween(target, source);

      for (let i = 0; i < existingConnections.length; i++) {
        let src = graph.getModel().getTerminal(existingConnections[i], true);
        let trg = graph.getModel().getTerminal(existingConnections[i], false);

        if (src.id === target.id && trg.id === source.id) {
          // Se uma conexão inversa já existe
          graph.getModel().beginUpdate();
          try {
            dispatch(setText("Uma conexão inversa já existe!"));
            target.removeEdge(edge, true);

            break;

          } finally {
            graph.getModel().endUpdate();
          }
        }
      }

      if (sourceType !== 'start') {
        let currentSource = source; // Começa com a fonte atual
        let foundStart = false; // Flag para indicar se encontrou um 'start'

        // Loop para subir a cadeia de ancestrais
        while (!foundStart && currentSource) {
          let edges = graph.getModel().getIncomingEdges(currentSource);
          if (edges.length > 0) {
            // Assume que cada vértice tem apenas uma aresta entrante
            let nextSource = graph.getModel().getTerminal(edges[0], true);
            if (nextSource) {
              let style = nextSource.getStyle();
              if (style) {
                let match = style.match(regex);
                if (match && match[1] === 'start') {
                  foundStart = true; // Encontrou um ancestral do tipo 'start'
                } else {
                  currentSource = nextSource; // Atualiza a fonte atual e continua o loop
                }
              } else {
                break; // Sai do loop se o estilo não for definido
              }
            } else {
              break; // Sai do loop se não houver mais fontes
            }
          } else {
            break; // Sai do loop se não houver arestas entrantes
          }
        }

        if (!followsStartFlow(target, graph) || !followsStartFlow(source, graph)) {

          target.removeEdge(edge, true);
          mxUtils.alert('A conexão deve seguir o fluxo a partir de "start".');
          dispatch(setText("A conexão deve seguir o fluxo a partir de start"));
          evt.consume();
        }
      }
        //!todo: animation
        //const edges = edges;
        //console.log(edges)
        //var state = graph.view.getState(edge);
        //console.log(state)

        //state.shape.node.getElementsByTagName('path')[0].removeAttribute('visibility');
        //state.shape.node.getElementsByTagName('path')[0].setAttribute('stroke-width', '6');
        //state.shape.node.getElementsByTagName('path')[0].setAttribute('stroke', 'lightGray');
        //state.shape.node.getElementsByTagName('path')[1].setAttribute('class', 'flow');

    });
    mxUtils.alert = function(message) {
      dispatch(setText("Emitindo evento de erro:"+ message));
    };

    /*if (!followsStartFlow(target) || !followsStartFlow(source)) {
      target.removeEdge(edge, true);
      mxUtils.alert('A conexão deve seguir o fluxo a partir de "start".');
      evt.consume();
    }*/

  };
  const followsStartFlow = (vertex, graph) => {

    if (!vertex) return false;
    // Verifica se o vértice é do tipo 'start' através do seu estilo
    const style = vertex.getStyle();
    const regex = /static\/media\/start\.[^.]+\./;
    if (style && regex.test(style)) {
      return true; // O vértice atual é 'start'
    }

    // Rastreia o caminho de entrada até encontrar um 'start'
    let incomingEdges = graph.getModel().getIncomingEdges(vertex);
    for (let i = 0; i < incomingEdges.length; i++) {
      let source = graph.getModel().getTerminal(incomingEdges[i], true);
      if (source && followsStartFlow(source, graph)) {
        return true; // Caminho válido encontrado
      }
    }

    // Não encontrou um caminho válido até 'start'
    return false;
  };
  useEffect(() => {


    if (!mxClient.isBrowserSupported()) {
      mxUtils.error('Browser não suportado!', 200, false);
      return;
    }

    const newGraph = initGraph(graphContainer.current);
    addClickEventListener(newGraph);
    addConsoleEventListener(newGraph);


    const initialWidth = graphContainer.current.offsetWidth;
    const initialHeight = graphContainer.current.offsetHeight;
    newGraph.addListener(mxEvent.SIZE, (sender, evt) => {
      graphContainer.current.style.width = `${initialWidth}px`;
      graphContainer.current.style.height = `${initialHeight}px`;
    });

    const sendGraphDataToAPI = async () => {
      const encoder = new mxCodec();
      const result = encoder.encode(newGraph.getModel());
      const xml = mxUtils.getXml(result);
      try {
        // Aqui chamamos a função sendPostData e passamos formData como argumento
        const response = await sendGraphApi({data: xml});
      } catch (error) {
        console.error('Erro ao enviar:', error);
      }
    };

    newGraph.getModel().addListener(mxEvent.CHANGE, sendGraphDataToAPI);
    const parent = newGraph.getDefaultParent();

    const fetchGraphData = async () => {
      try {
        const response = await getLastGraph();
        console.log(response);
        parseString(response.data, function (err, result) {
          Object.values(result.mxGraphModel.root).forEach(val => {
            Object.entries(val.mxCell).forEach(entry => {
              const [key, value] = entry;
              if(value.$.vertex === '1') {
                if (key !== '0') {
                  if (key !== '1') {
                    console.log(value.$.parent);

                    newGraph.insertVertex(parent, value.$.id, value.$.value, value.mxGeometry[0].$.x, value.mxGeometry[0].$.y, 48, 48, value.$.style);
                  }
                }
              }
              if (value.$.edge === '1') {
                const edge = newGraph.insertEdge(parent, value.$.id, value.$.value, newGraph.model.getCell(value.$.source), newGraph.model.getCell(value.$.target));
                if (value.Array && value.Array.mxPoint) {
                  let geometry = new mxGeometry();
                  geometry.relative = true;
                  edge.geometry = geometry;
                  geometry.points = value.Array.mxPoint.map(point => new mxPoint(point.$.x, point.$.y));
                  newGraph.model.setGeometry(edge, geometry);
                }
              }

            });
          });
        });
        // Atualiza o estado com os dados recebidos
        //setGraphData(response.data);
      } catch (error) {
        console.error('Erro ao buscar o último gráfico:', error);
      }
    };

    fetchGraphData();
    return () => {
      newGraph.destroy();
    };
  // eslint-disable-next-line
  }, [graphContainer]); // As dependências corretas devem ser listadas aqui




  return (
    <div ref={graphContainer} className="graph-container" onDrop={drop} onDragOver={(e) => e.preventDefault()}></div>
  );
};

export default MxGraphComponent;
