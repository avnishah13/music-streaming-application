import { createApp } from 'vue';
import { ref } from 'vue';
import router from '/static/js/router.js';

const update_creator_profile = {
	template: `
	<div id="app">
	<nav class="navbar navbar-expand-lg bg-body-tertiary">
	  <div class="container-fluid">
	    <div class="navbar-collapse collapse w-100 order-1 order-md-0 dual-collapse2">
	      <ul class="navbar-nav mr-auto">
	        <svg xmlns="http://www.w3.org/2000/svg" width="40px" height="45px" fill="white" class="bi bi-music-note" viewBox="0 0 16 16">
	          <path d="M9 13c0 1.105-1.12 2-2.5 2S4 14.105 4 13s1.12-2 2.5-2 2.5.895 2.5 2"/>
	          <path fill-rule="evenodd" d="M9 3v10H8V3z"/>
	          <path d="M8 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 13 2.22V4L8 5z"/>
	        </svg>
	        <router-link class="navbar-brand" to="/creator" style="font-size: 30px;">&nbsp;Harmonix</router-link>
	        
	      </ul>
	      <ul class="navbar-nav mr-auto" style="margin-left: 1150px;">
	      <div class="dropdown dropright">
	        <button role="button" @click="show_dropdown($event)" type="button" class="btn dropdown" to="#" data-bs-toggle="dropdown" id="dropdownMenu1" aria-haspopup="true" aria-expanded="false"> 
	          <span class="navbar-toggler-icon" style="height: 40px; width: 40px;"></span>
	      	</button>
	        <div id="dropdown" class="dropdown-menu pull-left" aria-labelledby="dropdownMenu1">
	          <router-link class="dropdown-item" to="/creator/album">Create Album</router-link>
	          <router-link class="dropdown-item" to="/creator/song">Upload Song</router-link>
	          <router-link class="dropdown-item" to="/creator/album/manage">Manage Albums</router-link>
	          <router-link class="dropdown-item" to="/creator/profile">Profile</router-link>
	          <router-link class="dropdown-item" to="/creator/collabs">Collaboration Requests</router-link>
	          <router-link class="dropdown-item" to="/user">Switch to User Profile</router-link>
	          <router-link class="dropdown-item" to="/log-out">Logout</router-link>
	        </div>
	      </div>
	    </ul>
	    </div>
	  </div>
	</nav><br><br>

	<div class="login_form">
	  <h1> Update Creator Profile </h1>
	  <form @submit.prevent="submit" action="/creator/profile/update" method="POST" enctype="multipart/form-data">
	    <fieldset>
	      <div class="form-group">
	        <label for="creator_name" class="form-label mt-4">Creator Name</label>
	        <input class="form-control" id="creator_name" name="creator_name" :value=creator.creator_name style="width: 600px; margin: 10px auto;" required>
	      </div>

	      <div>
	        <label for="image" class="form-label mt-4">Profile</label>
	        <input class="form-control" type="file" id="profile" name="profile" accept="image/*" @change="uploaded($event)" style="width: 600px; margin: 10px auto;">
	      </div><br>

	      <button type="submit" class="btn btn-primary">Submit</button>
	    </fieldset>
	  </form>
	</div><br>

	<div class="card text-center">
	  <div class="card-footer">Contact Us: 21f1001736@ds.study.iitm.ac.in</div>
	</div>
	</div>`,

	data() {
		return {
		    token: null,
			user_id: localStorage.getItem('user_id'),
			role: null,
			creator_id: null,
			creator: {},
			creator_profile: null,
			plays: null,
			songs: {},
			imageFile: null,
		}
	},

	methods: {
		async submit(){
			const formData = new FormData();
			formData.append('creator_name', document.getElementById('creator_name').value);
			formData.append('profile', this.imageFile);
			formData.append('creator_id', this.creator_id);
			formData.append('token', this.token);

		    const res = await fetch('/api/creator/signup', {
		        method: 'PUT',
		        body: formData
		    });
		    const result = await res.json();

			if (result.status_code === 200) {
				router.push({
		    		name: 'creator_profile',
		    		query: { message: "Profile Updated Successfully!" },
	    		});
		    }
		},

		show_dropdown(event) {
			const element = document.getElementById("dropdown");
			if (this.dropdown) {
				element.classList.remove("show");
				this.dropdown = false;
			} else {
				element.classList.add("show");
				this.dropdown = true;
			}
		},

		uploaded(event){
	      this.imageFile = event.target.files[0];
	    },
	},

	async created() {
    	document.title = 'Creator Profile';

    	const response = await fetch(`/api/redis/get/${this.user_id}`);
    	const data = await response.json();
    	if (data.data) {
	    	this.token = data.data.token;
	    	this.role = data.data.role;
	    	this.creator_id = data.data.creator_id;
	    }

    	if (this.token && this.role == 'Creator') {
    		const queryParams = new URLSearchParams({
			    creator_id: this.creator_id,
			    token: this.token,
			});

			const res = await fetch(`/api/creator/signup?${queryParams}`, {
		        method: 'GET',
		    });
		    const result = await res.json();
			if (result.status_code === 200) {
				this.creator = result.creator;
				console.log(this.creator)

			}
  		} else if (this.token && this.role == 'User') {
  			router.push({
	    		name: 'user_home',
				query: { auth: true }
    		});
  		} else if (this.token && this.role == 'Admin') {
  			router.push({
	    		name: 'admin_home',
				query: { auth: true }
    		});
  		} else {
  			router.push({
	    		name: 'creator_login',
				query: { login: true }
    		});
  		}
  	},

	async mounted() {
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = '/bootstrap/css/bootstrap.min.css';
		document.head.appendChild(link);

		const style = document.createElement('link');
		style.rel = 'stylesheet';
		style.href = '/css/main.css';
		document.head.appendChild(style);
	}
}

export default update_creator_profile