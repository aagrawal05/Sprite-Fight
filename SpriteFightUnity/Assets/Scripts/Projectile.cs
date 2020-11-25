using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Projectile : MonoBehaviour
{

    public float speed;
    public int damage;
    public Rigidbody2D rb;

    void Start()
    {
        rb.velocity = transform.right * speed;
    }
    void OnTriggerEnter2D (Collider2D hitInfo)
    {   
        PlayerScript player = hitInfo.GetComponent<PlayerScript>();
        if (player != null) {
            player.takeDamage(damage);
        } 
        Destroy(gameObject);
    }
}
