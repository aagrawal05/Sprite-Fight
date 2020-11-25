using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class PlayerScript : MonoBehaviour
{
    Animator animator;
	public GameObject bullet;
    public RuntimeAnimatorController Duck;
    public RuntimeAnimatorController Turtle;

    float horizontalMove;

    //Movement related variables
	public float moveSpeed;  //Our general move speed. This is effected by our
	                         //InputManager > Horizontal button's Gravity and Sensitivity
	                         //Changing the Gravity/Sensitivty will in turn result in more loose or tighter control
	public float sprintMultiplier;   //How fast to multiply our speed by when sprinting
	public float sprintDelay;        //How long until our sprint kicks in
	private float sprintTimer;       //Used in calculating the sprint delay
	private bool jumpedDuringSprint; //Used to see if we jumped during our sprint

	//Jump related variables
	private bool playerJumped;
	private bool playerJumping;
	public float jumpForce;       //How much force to give to our initial jump
	public float doubleJumpForce;
	private bool doubleJumpLeft;	//How many jumps left
	public Transform groundChecker;    //Gameobject required, placed where you wish "ground" to be detected from
	private bool isGrounded;             //Check to see if we are grounded

    private Vector3 characterScale;

	//Stat related vars
	public float hp;
	private float currentHp;
	public Slider hpBar;
    public Image hpBarImg;
    private float x;

	public Slider manaBar;
	public int mana;
	private int currentMana;

	public Slider expBar;
	private int expToNextLevel;
	public int currentExp;

	public Transform firePoint;

	public Image rangedAttackCDImage;
	private bool rangedAttack;
	private float rangedAttackTimer = 0;
	public float rangedAttackDamage;
	public float rangedAttackCD;

	private bool isAttacking;

    void Start()
    {
		currentHp = hp;

		expToNextLevel = 500;

		currentMana = mana;

		hpBar.maxValue = hp;
		hpBar.value = currentHp;

		manaBar.maxValue = mana;
		manaBar.value = currentMana;

		expBar.maxValue = expToNextLevel;
		expBar.value = currentExp;

        characterScale = transform.localScale;
        //Get the animator, which you attach to the GameObject you are intending to animate.
        animator = gameObject.GetComponent<Animator>();

    }


	void Update () {

		rangedAttackCDImage.fillAmount = 1-((Time.time-rangedAttackTimer)/rangedAttackCD);
		if (1-((Time.time-rangedAttackTimer)/rangedAttackCD) > 0 && 1-((Time.time-rangedAttackTimer)/rangedAttackCD) <= 1){
			animator.SetBool("RangedAttack", true);
		} else {
			animator.SetBool("RangedAttack", false);
		}

		//one or the other -->
        // Flip the Character:
        if (Input.GetAxis("Horizontal") < 0) {
			if (characterScale.x == 3){
				firePoint.Rotate(0f, 180f, 0f);
			}
            characterScale.x = -3;
        } 
		if (Input.GetAxis("Horizontal") > 0)
        {			
			if (characterScale.x == -3){
				firePoint.Rotate(0f, 180f, 0f);
			}
            characterScale.x = 3;
        }



		//Cool motion blur/shell spin animation
		/*if (Input.GetAxis("Horizontal") < 0 || Input.GetAxis("Horizontal") > 0) {
            characterScale.x = -characterScale.x;
		}*/
        transform.localScale = characterScale;
        horizontalMove = Input.GetAxis("Horizontal") * moveSpeed * Time.deltaTime;
        animator.SetFloat("Speed", Mathf.Abs(horizontalMove));
		//Casts a line between our ground checker gameobject and our player
		//If the floor is between us and the groundchecker, this makes "isGrounded" true
		isGrounded = Physics2D.Linecast(transform.position, groundChecker.position, 1 << LayerMask.NameToLayer("Ground"));
		//If our player hit the jump key, then it's true that we jumped!

		if (Input.GetButtonDown("Jump") && isGrounded){
			playerJumped = true;   //Our player jumped!
			doubleJumpLeft = true;
		}

        if (isGrounded){
			playerJumping = false;
            animator.SetBool("Jumping", false);
        } else {
			playerJumping = true;
            animator.SetBool("Jumping", true);
        }

		//If our player hit a horizontal key...
		if (Input.GetButtonDown("Horizontal")){
			sprintTimer = Time.time;  //.. reset the sprintTimer variable
			jumpedDuringSprint = false;  //... change Jumped During Sprint to false, as we lost momentum
		}

        if (Input.GetButtonDown("ChangeCharacter")){
            if(animator.runtimeAnimatorController == Duck){
                this.GetComponent<Animator>().runtimeAnimatorController = Turtle as RuntimeAnimatorController;
            } else {
                this.GetComponent<Animator>().runtimeAnimatorController = Duck as RuntimeAnimatorController;
            }
        }
	}

	void FixedUpdate (){
		
		//If our player is holding the sprint button, we've held down the button for a while, and we're grounded...
		//OR our player jumped while we were already sprinting...
		if (Input.GetButton("Sprint") && Time.time - sprintTimer > sprintDelay && isGrounded || jumpedDuringSprint){
			//... then sprint
			GetComponent<Rigidbody2D>().velocity = new Vector2(Input.GetAxis("Horizontal") * moveSpeed * Time.deltaTime * sprintMultiplier,GetComponent<Rigidbody2D>().velocity.y);

			//If our player jumped during our sprint...
			if (playerJumped){
				jumpedDuringSprint = true; //... tell the game that we jumped during our sprint!
				//This is a tricky one. Basically, if we are already sprinting and our player jumps, we want them to hold their
				//momentum. Since they are no longer grounded, we would not longer return true on a regular sprint because
				//the build-up of sprint requires the player to be grounded. Likewise, if our player presses another horizontal
				//key, the jumpedDuringSprint would be set to false in our Update() function, thus causing a "loss" in momentum.
			}
		} else {
			//If we're not sprinting, then give us our general momentum
			GetComponent<Rigidbody2D>().velocity = new Vector2(Input.GetAxis("Horizontal") * moveSpeed * Time.deltaTime,GetComponent<Rigidbody2D>().velocity.y);
		}

		//If our player pressed the jump key...
		if (playerJumped){
			GetComponent<Rigidbody2D>().AddForce(new Vector2(0,jumpForce)); //"Jump" our player up in the air!
			playerJumped=false;
		} else if (playerJumping && doubleJumpLeft && Input.GetButtonDown("Jump")){
			GetComponent<Rigidbody2D>().AddForce(new Vector2(0,doubleJumpForce)); //"Jump" our player up in the air!
			doubleJumpLeft = false;
		}

		if (Input.GetButtonDown("Fire1") && Time.time-rangedAttackTimer >= rangedAttackCD && isGrounded){
			rangedAttack = false;
			Instantiate(bullet, firePoint.transform.position, firePoint.transform.rotation);
			rangedAttackTimer = Time.time;
		}
	}

	public void takeDamage(int dmg){
		currentHp -= dmg;
		if (currentHp>0){
			hpBar.value = currentHp;
        	x = currentHp/hp;
        	hpBarImg.color = new Color(2.0f * (1-x), 2.0f * x, 0);
		} else {
			Destroy(gameObject);
		}
	}
}
