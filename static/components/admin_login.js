import { createApp } from 'vue';
import { ref } from 'vue';
import router from '/static/js/router.js';

const admin_login = {
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
	            <router-link class="nav-link" to="/">Login as User</a>
	          </li>
	          <li class="nav-item">
	            <router-link class="nav-link" to="/creator/login">Login as Creator</a>
	          </li>
	        </ul>
	    </div>
	  </div>
	</nav>

	<div class="box">
	  <div class="login_form"><br><br>
	    <h1 style="text-align: center;"> Admin Login </h1>
	    <form action="/" @submit.prevent="submit" method="POST" id="create-login-form" style="text-align: center;">
	      <fieldset>
	        <div class="form-group">
	          <label for="username" class="form-label mt-4">Username</label>
	          <div v-if="username_check">
	            <input style="text-align: center;" class="form-control is-invalid" id="username" placeholder="      Username" name="username" style="width: 400px; margin: 10px auto;" required>
	            <div class="invalid-feedback" style="width: 400px; margin: 10px auto;">Sorry, invalid account information. Please try again!</div>
	          </div>
	          <div v-else>
	            <input style="text-align: center;" class="form-control" id="username" placeholder="Username" name="username" style="width: 400px; margin: 10px auto;" required>
	          </div>
	        </div>

	        <div class="form-group">
	          <label for="password" class="form-label mt-4">Password</label>
	          <div v-if="password_check">
	            <input style="text-align: center;" type="password" class="form-control is-invalid" id="password" placeholder="      Password" name="password" style="width: 400px; margin: 10px auto;" required>
	            <div class="invalid-feedback">Sorry, wrong password. Please try again!</div>
	          </div>
	          <div v-else>
	            <input style="text-align: center;" type="password" class="form-control" id="password" placeholder="Password" name="password" style="width: 400px; margin: 10px auto;" required>
	          </div>
	        </div><br>
	        <p>

	        <button type="submit" class="btn btn-primary" style="background-color: #e7e7e7; color: black;">Log In</button>
	      </fieldset>
	    </form><br><br>
	</div>

	<div class="card text-center">
	  <div class="card-footer">Contact Us: 21f1001736@ds.study.iitm.ac.in</div>
	</div>
	</div>
	</body>
	</div>`,

	data() {
		return {
			password_check: ref(false),
			username_check: ref(false),
			login: this.$route.query.login,
		}
	},

	methods: {
		async submit(){
			const thisForm = document.getElementById('create-login-form');
		   	const formData = {
		        username: document.getElementById('username').value,
		        password: document.getElementById('password').value
		    };
		    const res = await fetch('/api/admin/login', {
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

				if (result.role == 'Admin') {
		    		router.push('/admin');
		    	} else if (result.role == 'User'){
		    		router.push({
			    		name: 'user_home',
						query: { auth: true }
		    		});
		    	} else if (result.role == 'Creator'){
		    		router.push({
			    		name: 'creator_home',
						query: { auth: true }
		    		});
			    }
			} else if (result.message === 'Wrong Account Details') {
		    	this.username_check = true;
		    	this.password_check = false;
		    } else if (result.message === 'Incorrect Password') {
		    	this.password_check = true;
		    	this.username_check = false;
		    }
		},

		close_toast(event) {
			this.login = false;
		}
	},

	created() {
    	document.title = 'Admin Login';
  	},

	async mounted() {
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = '/bootstrap/css/bootstrap.min.css';
	document.head.appendChild(link);
	}
}

export default admin_login