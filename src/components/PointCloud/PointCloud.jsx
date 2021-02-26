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
            topic: Constants.POINTCLOUD_TOPIC,
            material: { size: 0.1, color: 0xaaaaaa },
            max_pts: 10000000
        });

        const global_plan = new ROS3D.Path({
            ros: ros,
            tfClient: tfClient,
            rootObject: viewer.scene,
            topic: Constants.GLOBAL_PLAN,
            color: 0xFF0000,
        });

        const local_plan = new ROS3D.Path({
            ros: ros,
            tfClient: tfClient,
            rootObject: viewer.scene,
            topic: Constants.LOCAL_PLAN,
            color: 0x00FF00 ,
        });

        // Topic for publishing robot commands
        var cmdPos = new ROSLIB.Topic({
            ros: ros,
            name: Constants.COMMAND_TOPIC,
            messageType: "geometry_msgs/Point"
        });

        viewer.cameraControls.addEventListener("mousedown", (event3D) => {
            var domEvent = event3D.domEvent;
            domEvent.preventDefault();
            console.log("Mouse event: ", event3D);

            // pos_x and pos_y are between -1 and 1, specified within the
            // rectangular bounding box of the viewer frame
            //var posX = event3D.mousePos.x;
            //var posY = event3D.mousePos.y;

            switch (domEvent.button) {
                case 0:
                    // Left mouse button
                    var origin = event3D.mouseRay.origin;
                    var direction = event3D.mouseRay.direction;

                    // Find where mouse click intersects with the z=0 plane
                    // Alternatively, may want to use event3D.currentTarget and
                    // event3D.intersection to find nearest point on pointcloud
                    var scaleFactor = origin.z / direction.z;
                    var x = origin.x - scaleFactor * direction.x;
                    var y = origin.y - scaleFactor * direction.y;
                    var z = origin.z - scaleFactor * direction.z; // should be 0
                    console.log("Mouse down: X ", x, ", Y ", y, ", Z ", z);
                
                    // Send position command to robot
                    var position = new ROSLIB.Message({
                        x: x,
                        y: y,
                        z: z
                    });
                    cmdPos.publish(position);
                    break;

                case 1:
                    // Middle mouse button
                    break;

                case 2:
                    // Right mouse button
                    break;
            }
        });
    })

    return (
        <div id={DIV_ID}></div>
    );
}

export default PointCloud;
