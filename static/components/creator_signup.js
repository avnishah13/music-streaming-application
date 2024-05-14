import { createApp } from 'vue';
import { ref } from 'vue';
import router from '/static/js/router.js';

const creator_signup = {
	template: `
	<div id="app">
	<div v-if="auth" aria-live="polite" aria-atomic="true" class="position-relative">
	  <div class="toast-container position-absolute top-0 end-0 p-3">
	    <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
	      <div class="toast-header">
	        <strong class="me-auto">Please create your creator account to proceed further.</strong>
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
	        <router-link class="navbar-brand" to="/user" style="font-size: 30px;">&nbsp;Harmonix</a>
	        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
	          <span class="navbar-toggler-icon"></span>
	        </button>
	      </ul>
	        <ul class="navbar-nav ml-auto" style="margin-left: 970px;">
	          <li class="nav-item">
	            <router-link to="/user" class="nav-link">Switch to User Profile&nbsp;&nbsp;&nbsp;</router-link>
	          </li>
	        </ul>
	    </div>
	  </div>
	</nav>

	<div class="box">
	  <div class="login_form"><br><br><br>
	    <h1 style="text-align: center;"> Creator Singup </h1>
	    <form action="/" @submit.prevent="submit" enctype="multipart/form-data" method="POST" id="create-login-form" style="text-align: center;">
	      <fieldset>
	        <div class="form-group">
	          <label for="creator_name" class="form-label mt-4">Creator Name</label>
	            <input style="text-align: center;" class="form-control" id="creator_name" placeholder="Bob Dylan" name="creator_name" style="width: 600px; margin: 10px auto;" required>
	        </div>

	        <div class="form-group">
	          <label for="password" class="form-label mt-4">Confirm Password</label>
	          <div v-if="password_check">
	            <input style="text-align: center;" type="password" class="form-control is-invalid" id="password" placeholder="      Password" name="password" style="width: 600px; margin: 10px auto;" required>
	            <div class="invalid-feedback">Sorry, wrong password. Please try again!</div>
	          </div>
	          <div v-else>
	            <input style="text-align: center;" type="password" class="form-control" id="password" placeholder="Password" name="password" style="width: 600px; margin: 10px auto;" required>
	          </div>
	        </div>	        
	        
	        <div>
				<label for="image" class="form-label mt-4">Image</label>
				<input class="form-control" type="file" id="profile" name="profile" accept="image/*" @change="uploaded($event)" style="width: 600px; margin: 10px auto;">
			</div><br><br>

	        <button type="submit" class="btn btn-primary" style="background-color: #e7e7e7; color: black;">Signup</button>
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
			auth: this.$route.query.auth,
			token: null,
			user_id: localStorage.getItem('user_id'),
			isUploaded: false,
			imageFile: null,
		}
	},

	methods: {
		async submit(){
		   	const formData = new FormData();
            formData.append('profile', this.imageFile);
            formData.append('creator_name', document.getElementById('creator_name').value);
            formData.append('password', document.getElementById('password').value);
            formData.append('user_id', this.user_id);
           	formData.append('token', this.token); 

		    const res = await fetch('/api/creator/signup', {
		        method: 'POST',
		        body: formData
		    });
		    const result = await res.json();

			if (result.status_code === 200) {
				const response = await fetch(`/api/redis/set/${this.user_id}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					'token': this.token,
					'role': result.role,
					'creator_id': result.creator_id,
				})
				});
	    		router.push('/creator');
		    } else if (result.message === 'Incorrect Password') {
		    	this.password_check = true;
		    } 
		},

		uploaded(event){
			this.imageFile = event.target.files[0];
		},

		close_toast(event) {
			this.auth = false;
		}
	},

	async created() {
    	document.title = 'Creator Signup';

    	const response = await fetch(`/api/redis/get/${this.user_id}`);
    	const data = await response.json();
    	if (data.data) {
	    	this.token = data.data.token;
	    }

    	if (this.token) {
			return
		}
		else {
			router.push({
	    		name: 'user_login',
				query: { login: true }
    		});
		}
  	},

	async mounted() {
		this.base_server_url = this.$root.base_server_url
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = '/bootstrap/css/bootstrap.min.css';
		document.head.appendChild(link);

		const style = document.createElement('link');
		style.rel = 'stylesheet';
		style.href = '/css/home.css';
		document.head.appendChild(style);
	}
}

export default creator_signup