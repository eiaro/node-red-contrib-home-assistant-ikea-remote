const selectn = require('selectn');
const EventsHaNode = require('node-red-contrib-home-assistant-websocket/lib/events-ha-node');

module.exports = function (RED) {
    const nodeOptions = {
        config: {
            device_ieee: {},
            event_type: {},
            waitForRunning: (nodeDef) => nodeDef.waitForRunning || true,
        },
    };

    class E1810Node extends EventsHaNode {
        constructor(nodeDefinition) {
            super(nodeDefinition, RED, nodeOptions);

            this.device_ieee = nodeDefinition.device_ieee;

            this.addEventClientListener(
                'ha_events:' + "zha_event",
                this.onHaEventsAll.bind(this)
            );
            
            // Registering only needed event types
            if (selectn('nodeConfig.server.homeAssistant', this)) {
                this.nodeConfig.server.homeAssistant.eventsList[this.id] = 'zha_event';
                this.updateEventList();
            }
        }

        onHaEventsAll(evt) {
            if (this.isEnabled === false) return;

            if (
                !this.isHomeAssistantRunning &&
                this.nodeConfig.waitForRunning === true
            ) {
                return;
            }
            
            // for now just pass the event on
            if (evt.event.device_ieee === this.device_ieee)
            {
                this.send({
                event_type: evt.event_type,
                topic: evt.event_type,
                payload: evt,
            });
        }
            this.setStatusSuccess(evt.event_type);
        }

        clientEvent(type, data) {
            if (this.isEnabled === false) return;

            // silently pass all these
        }

        onClose(nodeRemoved) {
            super.onClose(nodeRemoved);

            if (nodeRemoved) {
                delete this.nodeConfig.server.homeAssistant.eventsList[this.id];
                this.updateEventList();
            }
        }

        onHaEventsClose() {
            super.onHaEventsClose();
            this.clientEvent('disconnected');
        }

        onHaEventsOpen() {
            super.onHaEventsOpen();
            this.clientEvent('connected');
        }

        onHaEventsConnecting() {
            super.onHaEventsConnecting();
            this.clientEvent('connecting');
        }

        onHaEventsRunning() {
            super.onHaEventsRunning();
            this.clientEvent('running');
        }

        onHaEventsError(err) {
            super.onHaEventsError(err);
            if (err) {
                this.clientEvent('error', err.message);
            }
        }

        onClientStatesLoaded() {
            this.clientEvent('states_loaded');
        }

        onClientServicesLoaded() {
            this.clientEvent('services_loaded');
        }

        updateEventList() {
            if (this.isConnected) {
                this.websocketClient.subscribeEvents(
                    this.nodeConfig.server.homeAssistant.eventsList
                );
            }
        }
    }

    RED.nodes.registerType('e1810-node', E1810Node, {
        category: 'home_assistant',
    color: '#399CDF',
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        device_ieee: { value: '', required: false },
        exposeToHomeAssistant: { value: false },
        haConfig: {
            value: [
                { property: 'name', value: '' },
                { property: 'icon', value: '' },
            ],
        },
        waitForRunning: { value: true },
    },
    inputs: 0,
    outputs: 6,
    outputLabels: ["on", "left", "right", "dim_down", "dim_up", "output"],
    icon: 'ha-events-all.svg',
    paletteLabel: 'events: all',
    label: function () {
        return this.name || `e1810: ${this.device_ieee}`;
    },    
    oneditprepare: function () {
        haServer.init(this, '#node-input-server');
        exposeNode.init(this);

        if (this.waitForRunning === undefined) {
            $('#node-input-waitForRunning').prop('checked', true);
        }
    },
    oneditsave: function () {
        this.haConfig = exposeNode.getValues();
    },
    });
};

