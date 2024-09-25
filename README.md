# NodeRED access to HCL Domino's REST API

(C) 2023 HCL America Inc. Apache-2.0 license [https://www.apache.org/licenses/LICENSE-2.0](https://www.apache.org/licenses/LICENSE-2.0)

[![npm](https://nodei.co/npm/@hcl-software/node-red-domino.png)](https://www.npmjs.com/package/@hcl-software/node-red-domino)

This repository contains the NodeRED nodes to interact with the HCL Domino REST API. It uses the [Domino REST API SDK for NodeJS](https://github.com/HCL-TECH-SOFTWARE/domino-rest-sdk-node) under the hood.

![SDK Model](img/dominored.png)

## Installation

Install the palette manager or `npm` like any other [NodeRED](https://nodered.org/) node

```bash
npm install @hcl-software/node-red-domino
```

The installation will add one node in `network` and two related configuration nodes.
![Domino Node](img/dominonode.png). Each node gets configured with a credential and a connection configuration node. Multiple Domino can share the same Credential and Connection node.

## Usage

Each Domino Node can be configured to execute [**one OperationId**](https://opensource.hcltechsw.com/Domino-rest-api/topicguides/howkeepworks.html?h=operationid). The node translates the OperationId into the actual operation URL and checks for mandatory parameters.

### Configuration

A new Node and the related configuration nodes show regular entry fields:

![Domino Node](img/EmptyDOminoNode.png)
![Domino Credential Node](img/EmptyCredentialsNode.png)
![Domino Connection Node](img/EmptyConnectionNode.png)

After saving and re-opening the dialogs query the server and populate the drop-down list:

![Domino Node](img/FullDominoNode.png)
![Domino Node](img/FullDominoNode2.png)
![Domino Credential Node](img/FullCredentialsNode.png)
![Domino Connection Node](img/FullConnectionNode.png)

Check the node help and the official [Domino REST API Documentation](https://opensource.hcltechsw.com/Domino-rest-api/) for details, especially around [Operation IDs](https://opensource.hcltechsw.com/Domino-rest-api/references/openapidefinitions.html)

### Flows

- refer to the exsample directory
- all parameters (well most of) are in the `msg.payload`
- payload can have a `params` object for parameters and a `body` object for request bodies. Both objects are optional
- You can specify a `msg.unid` to interact with one document
- responses that can have more than one result (lists, query) emit on result for each entry. This can be switched off using `single result (no splitting)`

## Known limitations

- To take advantage of the selection list, you need to add the Credential and COnnection Configuration Nodes and close the DOmino Node. On Open the configuration queries teh server and offers APis, scope and OperationIds found on your selected server.
- th http response node can't send chunked responses, so in a http flow you need to select `single result (no splitting)`.

## Documentation

![SDK Model](sdk-model.png)

- [Domino REST API Documentation](https://opensource.hcltechsw.com/Domino-rest-api/)

## Feedback & Contribution

- [Issues](https://github.com/HCL-TECH-SOFTWARE/domino-rest-sdk-nodered/issues)
- [OpenNTF discord](https://discord.com/invite/jmRHpDRnH4)
- Pull requests accepted - [Contributions](CONTRIBUTING.md)
- [Code of conduct](CODE_OF_CONDUCT.md)

## Changelog

### 0.1.0 November 2023 Release

- initial release
