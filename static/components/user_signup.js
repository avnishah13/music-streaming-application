import { createApp } from 'vue';
import { ref } from 'vue';
import router from '/static/js/router.js';

const user_signup = {
	template: `
	<div id="app">
	<div v-if="login" aria-live="polite" aria-atomic="true" class="position-relative">
	  <div class="toast-container position-absolute top-0 end-0 p-3">
	    <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
	      <div class="toast-header">
	        <strong class="me-auto">Please login to access this page.</strong>
	        <button type="button" @click="close_toast($event)" class="btn-close ms-2 mb-1" data-bs-dismiss="toast" aria-label="Close">
	          <span aria-hidden="true"></span>
	        </button>
	      </div>
	    </div>
	  </div>
	</div>

	<nav class="navbar navbar-expand-lg bg-body-tertiary">
	  <div class="container-fluid">
	    <div class="navbar-collapse collapse w-100 order-1 order-md-0 dual-collapse2">
	      <ul class="navbar-nav mr-auto">
	        <svg xmlns="http://www.w3.org/2000/svg" width="40px" height="45px" fill="white" class="bi bi-music-note" viewBox="0 0 16 16">
	          <path d="M9 13c0 1.105-1.12 2-2.5 2S4 14.105 4 13s1.12-2 2.5-2 2.5.895 2.5 2"/>
	          <path fill-rule="evenodd" d="M9 3v10H8V3z"/>
	          <path d="M8 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 13 2.22V4L8 5z"/>
	        </svg>
	        <router-link class="navbar-brand" to="/" style="font-size: 30px;">&nbsp;Harmonix</a>
	        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
	          <span class="navbar-toggler-icon"></span>
	        </button>
	      </ul>
	        <ul class="navbar-nav ml-auto" style="margin-left: 865px;">
	          <li class="nav-item">
	            <router-link to="/admin/login" class="nav-link">Login as Admin</router-link>
	          </li>
	          <li class="nav-item">
	            <router-link to="/creator/login" class="nav-link">Login as Creator</router-link>
	          </li>
	        </ul>
	    </div>
	  </div>
	</nav><br>

	<div class="box" id="app">

	  <div class="login_form">
	    <h1 style="text-align: center;"> User Signup </h1>
	    <form @submit.prevent="submit" action="/user/signup" style="text-align: center;" method="POST" id="create-user-form">
	      <fieldset>
	        <div class="form-group">
	          <label for="username" class="form-label mt-4">Name</label>
	          <input style="text-align: center;" class="form-control" id="name" placeholder="John Doe" name="name" style="width: 600px; margin: 10px auto;" required>
	        </div>

	        <div class="form-group">
	          <label for="username" class="form-label mt-4">Username</label>
	          <div v-if="username_check">
	            <input style="text-align: center;" class="form-control is-invalid" id="username" placeholder="      Username" name="username" style="width: 600px; margin: 10px auto;" required>
	            <div class="invalid-feedback" style="width: 400px; margin: 10px auto;">Sorry, that username's taken. Try again?</div>
	          </div>
	          <div v-else>
	            <input style="text-align: center;" class="form-control" id="username" placeholder="Username" name="username" style="width: 600px; margin: 10px auto;" required>
	          </div>
	        </div>

	        <div class="form-group">
	          <label for="password" class="form-label mt-4">Password</label>
	          <input style="text-align: center;" type="password" class="form-control" id="password" placeholder="Password" name="password" minlength="8" style="width: 600px; margin: 10px auto;" required>
	        </div>

	        <div class="form-group">
	          <label for="email" class="form-label mt-4">Email address</label>
	          <div v-if="email_check">
	            <input style="text-align: center;" type="email" class="form-control is-invalid" id="email" aria-describedby="emailHelp" placeholder="      johndoe@gmail.com" name="email" style="width: 600px; margin: 10px auto;" required>
	            <div class="invalid-feedback" style="width: 400px; margin: 10px auto;">Sorry, that email ID's taken. Try again?</div>
	          </div>
	          <div v-else>
	            <input style="text-align: center;" type="email" class="form-control" id="email" aria-describedby="emailHelp" placeholder="      johndoe@gmail.com" name="email" style="width: 600px; margin: 10px auto;" required>
	            <small style="text-align: center;" id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
	          </div>
	        </div>

	        <div class="form-group">
	          <label class="form-label mt-4">Phone Number</label>
	          <div v-if="phone_check">
	            <div class="select">
	              <input style="text-align: center;" id="phone" type="tel" class="form-control is-invalid" placeholder="9920711713" name="phone" minlength="10" maxlength="10" pattern="[0-9]{10}" style="width: 600px; margin: 10px auto;" required>
	              <div class="text-danger" style="width: 600px; margin: 10px auto;">Sorry, that phone number's taken. Try again?</div>
	            </div>
	          </div>
	          <div v-else>
	            <div class="select">
	              <input style="text-align: center;" id="phone" type="tel" class="form-control" placeholder="9920711713" name="phone" minlength="10" maxlength="10" pattern="[0-9]{10}" style="width: 600px; margin: 10px auto;" required>
	            </div>
	          </div>
	        </div><br><br>

	        <button type="submit" class="btn btn-primary" style="background-color: #e7e7e7; color: black;">Signup</button>
	      </fieldset>
	    </form><br><br><br>
	    <p style="text-align: center;" class="text-muted">Already have an account? <router-link to="/"> Login in. </a></p><br>


	  </div>
	  <div class="card text-center">
	    <div class="card-footer text-muted">
	      Contact Us: 21f1001736@ds.study.iitm.ac.in
	    </div>
	  </div>
	</div>`,

	data() {
		return {
			login: ref(false),
			email_check: ref(false),
			username_check: ref(false),
			phone_check: ref(false),
			login: this.$route.query.login,
		}
	},

	methods: {
		async submit(){
			const thisForm = document.getElementById('create-user-form');
		   	const formData = {
		   		name: document.getElementById('name').value,
		        username: document.getElementById('username').value,
		        password: document.getElementById('password').value,
		        email: document.getElementById('email').value,
		        phone: document.getElementById('phone').value,
		    };
		    const res = await fetch('/api/signup', {
		        method: 'POST',
		        headers: { 'Content-Type': 'application/json' },
		        body: JSON.stringify(formData)
		    });
		    const result = await res.json();

			if (result.status_code === 200) {
				localStorage.setItem('user_id', result.user_id);

				const response = await fetch(`/api/redis/set/${result.user_id}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					'token': result.token,
					'role': result.role,
				})
				});

		    	router.push('/user');
		    } else if (result.message === 'Username taken') {
		    	this.username_check = true;
		    	this.email_check = false;
		    	this.phone_check = false;
		    } else if (result.message === 'Email taken') {
		    	this.email_check = true;
		    	this.username_check = false;
		    	this.phone_check = false;
		    } else if (result.message === 'Phone number taken') {
		    	this.phone_check = true;
		    	this.username_check = false;
		    	this.email_check = false;
		    } 
		},

		close_toast(event) {
			this.auth = false;
		},
	},

	created() {
    	document.title = 'Signup';
  	},

	async mounted() {
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = '/bootstrap/css/bootstrap.min.css';
	document.head.appendChild(link);
	}
}

export default user_signup