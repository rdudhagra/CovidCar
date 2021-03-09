import React, { useEffect, useRef } from "react"
import { Row } from "react-bootstrap"
import * as ROS3D from 'ros3d'
import * as ROSLIB from 'roslib'
import * as THREE from 'three'

import * as Constants from "../../constants"

const DIV_ID = "pointcloud_viewer";

function PointCloud() {

    const divContainer = useRef(null);

    useEffect(() => {
        // Clear div so that hot reloading works
        divContainer.current.innerHTML = '';

        
        // Connect to ROS.
        var ros = new ROSLIB.Ros({
            url: Constants.WEBSOCKET_URL
        });

        // Create the main viewer.
        const viewer = new ROS3D.Viewer({
            divID: DIV_ID,
            width: divContainer.current.clientWidth,
            height: divContainer.current.clientHeight,
            antialias: true,
            alpha: 0.000001
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
        var cmdPose = new ROSLIB.Topic({
            ros: ros,
            name: Constants.COMMAND_TOPIC,
            messageType: "geometry_msgs/PoseStamped"
        });

        viewer.cameraControls.addEventListener("dblclick", (event3D) => {
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
                    var mouseOrigin = event3D.mouseRay.origin;
                    var mouseDir = event3D.mouseRay.direction;

                    // Calculate position command, by finding where mouse click intersects with z=0 plane
                    // Alternatively, may want to use event3D.currentTarget and
                    // event3D.intersection to find nearest point on pointcloud
                    var scaleFactor = mouseOrigin.z / mouseDir.z;
                    // pos = mouseDir - scaleFactor * mouseOrigin;
                    var pos = new THREE.Vector3().copy(mouseDir).multiplyScalar(-scaleFactor).add(mouseOrigin);

                    // Calculate orientation command, so that the forward direction is the current camera
                    // orientation, and the upwards direction is the +z axis
                    // Same code as Quaternion.LookRotation in Unity
                    var orient = new THREE.Quaternion();
                    var up = new THREE.Vector3(0, 0, 1);
                    mouseDir.normalize();

                    if(up.equals(mouseDir)) {
                        var v = mouseDir - up * up.dot(mouseDir);
                        v.normalize();
                        var q = new THREE.Quaternion().setFromUnitVectors(up, v);
                        orient = new THREE.Quaternion().setFromUnitVectors(v, mouseDir).multiply(q);
                    } else {
                        orient = new THREE.Quaternion().setFromUnitVectors(up, mouseDir);
                    }
                    
                    // Send position and orientation command to robot
                    var timestamp = new Date();
                    var secs = Math.floor(timestamp.getTime() / 1000);
                    var nsecs = 1000000 * (timestamp.getTime() % 1000);
                    var pose = new ROSLIB.Message({
                        header: {
                            seq: 0,
                            stamp: {
                                sec: secs,
                                nsec: nsecs
                            },
                            frame_id: "map",
                        },
                        pose: {
                            position: {
                                x: pos.x,
                                y: pos.y,
                                z: 0
                            },
                            orientation: {
                                x: 0,
                                y: 0,
                                z: orient.z,
                                w: orient.w
                            }
                        }
                    });
                    console.log("Pose message: ", pose);
                    cmdPose.publish(pose);
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
        <Row className="w-100 h-100" ref={divContainer} id={DIV_ID}></Row>
    );
}

export default PointCloud;
