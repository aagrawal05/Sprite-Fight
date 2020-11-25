using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CameraFollower : MonoBehaviour
{
    public GameObject player;       //Public variable to store a reference to the player game object
    public GameObject LWall;
    public GameObject RWall;

    private Vector3 offset;         //Private variable to store the offset distance between the player and camera
    private float yoffset;

    // Use this for initialization
    void Start () 
    {
        //Calculate and store the offset value by getting the distance between the player's position and camera's position.
        offset = transform.position - player.transform.position;
        yoffset = 3.75f;
        
    }
    
    // LateUpdate is called after Update each frame
    void LateUpdate () 
    {
        // Set the position of the camera's transform to be the same as the player's, but offset by the calculated offset distance.
        if (player != null){
            if (player.transform.position.x <= LWall.transform.position.x+13.75){    
                transform.position = new Vector3(LWall.transform.position.x+13.75f, player.transform.position.y+yoffset,  offset.z);
            } else if (player.transform.position.x >= RWall.transform.position.x-13.75){    
                transform.position = new Vector3(RWall.transform.position.x-13.75f, player.transform.position.y+yoffset,  offset.z);
            } else {
                transform.position = new Vector3(player.transform.position.x, player.transform.position.y+yoffset, offset.z);
            }
        }
    }
}
