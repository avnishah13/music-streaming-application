import { createApp } from 'vue';
import { ref } from 'vue';
import router from '/static/js/router.js';

const admin_home = {
	template: `
	<div id="app">
	<div v-if="message" aria-live="polite" aria-atomic="true" class="position-relative">
	  <div class="toast-container position-absolute top-0 end-0 p-3">
	    <div id="toast" class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
	      <div class="toast-header">
	        <strong class="me-auto">{{message}}</strong>
	        <button type="button" @click="close_toast($event)" class="btn-close ms-2 mb-1" data-bs-dismiss="toast" aria-label="Close">
	          <span aria-hidden="true"></span>
	        </button>
	      </div>
	    </div>
	  </div>
	</div>

	<div v-if="auth" aria-live="polite" aria-atomic="true" class="position-relative">
	  <div class="toast-container position-absolute top-0 end-0 p-3">
	    <div id="toast" class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
	      <div class="toast-header">
	        <strong class="me-auto">You're not authorized to access this page. We're sorry for the trouble!</strong>
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
	        <router-link class="navbar-brand" to="/admin" style="font-size: 30px;">&nbsp;Harmonix</router-link>
	        
	      </ul>
	      <ul class="navbar-nav mr-auto" style="margin-left: 700px;">
	      <form @submit.prevent="search" class="d-flex" id="search_form">
	        <input class="form-control me-sm-2" type="text" style="width: 300px;" name="search" placeholder="Search">
	        <button class="btn btn-secondary my-2 my-sm-0" type="submit" style="width: 120px; margin-right: 25px;">Search</button>
	      </form>
	      <div class="dropdown dropright">
	        <button role="button" @click="show_dropdown($event)" type="button" class="btn dropdown" to="#" data-bs-toggle="dropdown" id="dropdownMenu1" aria-haspopup="true" aria-expanded="false"> 
	          <span class="navbar-toggler-icon" style="height: 40px; width: 40px;"></span>
	      	</button>
	        <div id="dropdown" class="dropdown-menu pull-left" aria-labelledby="dropdownMenu1">
	          <router-link class="dropdown-item" to="/admin/songs">Songs</router-link>
	          <router-link class="dropdown-item" to="/admin/albums">Albums</router-link>
	          <router-link class="dropdown-item" to="/log-out">Logout</router-link>
	         </div>
	      </div>
	    </ul>
	    </div>
	  </div>
	</nav><br>

	<h1>Dashboard</h1><br>
	<div class="card border-primary mb-3" style="width: 20rem; margin-left: 50px; float:left;">
	  <div class="card-header">Total Users</div>
	  <div class="card-body">
	    <h1 class="card-title">{{total_users}}</h1>
	  </div>
	</div>

	<div class="card border-primary mb-3" style="width: 20rem; margin-left: 50px; float:left;">
	  <div class="card-header">Total Creators</div>
	  <div class="card-body">
	    <h1 class="card-title">{{total_creators}}</h1>
	  </div>
	</div>

	<div class="card border-primary mb-3" style="width: 20rem; margin-left: 50px; float:left;">
	  <div class="card-header">Total Songs Uploaded</div>
	  <div class="card-body">
	    <h1 class="card-title">{{total_songs}}</h1>
	  </div>
	</div>

	<div class="card border-primary mb-3" style="width: 20rem; margin-left: 50px; float:left;">
	  <div class="card-header">Total Albums</div>
	  <div class="card-body">
	    <h1 class="card-title">{{total_albums}}</h1>
	  </div>
	</div>
	<div style="clear:both;">&nbsp;</div><br>

	<div class="row">
	  <div class="col-6">
	    <img src="../charts/line.jpeg" alt="graph" width="550" height="350" style="display: block; margin-left: auto; margin-right: auto; padding: 10px;">
	  </div>
	  
	  <div class="col-6">
	    <img src="../charts/bar.jpeg" alt="graph" width="550" height="350" style="display: block; margin-left: auto; margin-right: auto; padding: 10px;">
	  </div>
	</div><br><br>

	<div class="card text-center">
		<div class="card-footer">Contact Us: 21f1001736@ds.study.iitm.ac.in</div>
	</div>
	</div>`,

	data() {
		return {
		    auth: this.$route.query.auth,
		    song_id: "",
		    token: null,
			user_id: localStorage.getItem('user_id'),
			role: null,
     		message:this.$route.query.message,
     		total_songs: null,
     		total_albums: null,
     		total_users: null,
     		total_creators: null,
     		dropdown: null,
		}
	},

	methods: {
		close_toast(event) {
			this.auth = false;
     		this.delete_message = false;
     		this.message = false;
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

		search(){
	 	router.push({
    		name: 'admin_search',
			query: { search: document.querySelector('#search_form input[type="text"]').value, }
		});
	},
	},

	async created() {
    	document.title = 'Admin Home';

    	const response = await fetch(`/api/redis/get/${this.user_id}`);
	    const data = await response.json();
	    if (data.data) {
	    	this.token = data.data.token;
	    	this.role = data.data.role;
	    }

    	if (this.token && this.role == 'Admin') {
    		const queryParams = new URLSearchParams({
			    token: this.token
			});

			const res = await fetch(`/api/admin?${queryParams}`, {
		        method: 'GET',
		    });
		    const result = await res.json();
			if (result.status_code === 200 && result.message === 'Retrieval Successful') {
				this.total_songs = result.total_songs;
				this.total_users = result.total_users;
				this.total_albums = result.total_albums;
				this.total_creators = result.total_creators;
			}    	
  		} else if (this.token && this.role == 'User') {
  			router.push({
	    		name: 'user_home',
				query: { auth: true }
    		});
  		} else if (this.token && this.role == 'Creator') {
  			router.push({
	    		name: 'creator_home',
				query: { auth: true }
    		});
  		} else {
  			router.push({
	    		name: 'admin_login',
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

export default admin_home