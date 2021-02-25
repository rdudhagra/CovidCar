import React, { useEffect } from "react"
import * as ROS3D from 'ros3d'
import * as ROSLIB from 'roslib'

import * as Constants from "../../constants"

const DIV_ID = "pointcloud_viewer";

function PointCloud() {

    useEffect(() => {
        // Connect to ROS.
        var ros = new ROSLIB.Ros({
            url: Constants.WEBSOCKET_URL
        });

        // Create the main viewer.
        const viewer = new ROS3D.Viewer({
            divID: DIV_ID,
            width: 800,
            height: 600,
            antialias: true
        });

        // Setup a client to listen to TFs.
        const tfClient = new ROSLIB.TFClient({
            ros: ros,
            angularThres: 0.01,
            transThres: 0.01,
            rate: 10.0,
            fixedFrame: Constants.TF_NAME
        });

        // Setup the map client.
        const laserScan = new ROS3D.PointCloud2({
            ros: ros,
            tfClient: tfClient,
            rootObject: viewer.scene,
            topic: Constants.POINTCLOUD_TOPIC
        })
    })

    return (
        <div id={DIV_ID}></div>
    );
}

export default PointCloud;