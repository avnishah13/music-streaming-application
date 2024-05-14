import { createApp } from 'vue';
import { ref } from 'vue';
import router from '/static/js/router.js';

const edit_album = {
	template: `
	<div id="app">
	<div v-if="uniq" aria-live="polite" aria-atomic="true" class="position-relative">
	    <div class="toast-container position-absolute top-0 end-0 p-3">
	      <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
	        <div class="toast-header">
	          <strong class="me-auto">Album with the same name already exists!</strong>
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
	</nav><br>

	<div class="login_form">
	  <h1> Edit Album </h1>
	  <form @submit.prevent="submit" action="/creator/album/{{album.album_id}}/edit" method="POST" enctype="multipart/form-data">
	    <fieldset>

	      <div class="form-group">
	        <label for="album_name" class="form-label mt-4">Album Name</label>
	        <input class="form-control" id="album_name" placeholder=Reputation name="album_name" :value=album.album_name style="width: 600px; margin: 10px auto;" required>
	      </div>

	      <div :class="[isUploaded ? 'uploaded' : 'notUploaded']">
	        <label for="image" class="form-label mt-4">Image</label>
	        <input class="form-control" type="file" id="image" name="image" accept="image/*" @change="uploaded($event)" style="width: 600px; margin: 10px auto;">
	      </div><br>

	      <div class="form-group">
	        <label for="language" class="form-label mt-4">Language</label>
	        <select style="text-indent: 45px;" class="form-select" id="language" name="language" style="width: 600px; margin: 10px auto; text-align: center;">
	          <option value="English">English</option>
	          <option value="Hindi">Hindi</option>
	          <option value="Spanish">Spanish</option>
	        </select>
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
			uniq: this.$route.query.uniq,
      		isUploaded: false,
      		album: false,
      		album_image: false,
      		album_id: this.$route.params.album_id,
      		imageFile: null,
		}
	},

	methods: {
		async submit(){
			const formData = new FormData();
            formData.append('album_image', this.imageFile);
            formData.append('album_name', document.getElementById('album_name').value);
            formData.append('language', document.getElementById('language').value);
            formData.append('creator_id', this.creator_id);
            formData.append('user_id', this.user_id);
            formData.append('album_id', this.album_id);
            formData.append('token', this.token);

		    const res = await fetch('/api/creator/album', {
		        method: 'PUT',
		        body: formData
		    });
		    const result = await res.json();

			if (result.status_code === 200) {
	    		router.push({
		    		name: 'manage_albums',
					query: { message: 'Album updated successfully!' }
	    		});
		    } else if (result.status_code === 401) {
		    	this.uniq = true;
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

		close_toast(event) {
			this.uniq = false;
		},

		uploaded(event){
			this.imageFile = event.target.files[0];
		},
	},

	async created() {
    	document.title = 'Edit Album';

    	const response = await fetch(`/api/redis/get/${this.user_id}`);
    	const data = await response.json();
    	if (data.data) {
	    	this.token = data.data.token;
	    	this.role = data.data.role;
	    	this.creator_id = data.data.creator_id;
	    }

    	if (this.token && this.role == 'Creator') {
    		const queryparams = new URLSearchParams({
			    album_id: this.album_id,
			    token: this.token,
			});

		    const res = await fetch(`/api/creator/album?${queryparams}`, {
		        method: 'get',
		    });
		    const result = await res.json();

			if (result.status_code === 200) {
				this.album = result.album;
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

	mounted() {
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

export default edit_album