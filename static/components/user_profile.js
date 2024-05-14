import { createApp } from 'vue';
import { ref } from 'vue';
import router from '/static/js/router.js';

const user_profile = {
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


	<nav class="navbar navbar-expand-lg bg-body-tertiary">
	  <div class="container-fluid">
	    <div class="navbar-collapse collapse w-100 order-1 order-md-0 dual-collapse2">
	      <ul class="navbar-nav mr-auto">
	        <svg xmlns="http://www.w3.org/2000/svg" width="40px" height="45px" fill="white" class="bi bi-music-note" viewBox="0 0 16 16">
	          <path d="M9 13c0 1.105-1.12 2-2.5 2S4 14.105 4 13s1.12-2 2.5-2 2.5.895 2.5 2"/>
	          <path fill-rule="evenodd" d="M9 3v10H8V3z"/>
	          <path d="M8 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 13 2.22V4L8 5z"/>
	        </svg>
	        <router-link class="navbar-brand" to="/user" style="font-size: 30px;">&nbsp;Harmonix</router-link>
	        
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
	        	<router-link class="dropdown-item" to="/user/profile">Profile</router-link>
	        	<button class="dropdown-item" @click="create_playlist($event)">New Playlist</button>
	        	<button v-if="flag" class="dropdown-item" @click="change_flag($event)">Hide Flagged Content</button>
	      		<button v-else class="dropdown-item" @click="change_flag($event)">View Flagged Content</button>
	      		<router-link v-if="role == 'Creator'" class="dropdown-item" to="/creator">Switch to Creator Profile</router-link>
	      		<router-link v-if="role == 'User'" class="dropdown-item" to="/creator/signup">Switch to Creator Profile</router-link>
          		<router-link class="dropdown-item" to="/log-out">Logout</router-link>
	        </div>
	      </div>
	    </ul>
	    </div>
	  </div>
	</nav><br><br>

	<h1 style="text-align: center; font-family: Copperplate, Papyrus, fantasy;">{{user.name}}</h1><br><br><br><br>

	<h1>Your Playlists</h1><br>
	<div>
	  <table class="table table-hover">
	  	<tr>
		  	<th style="font-size: 20px; width: 10%">#</th>
		  	<th style="width: 20%">Album Cover</th>
		  	<th style="font-size: 20px;">Playlist Name</th>
	  	</tr>
		<tr v-for="(playlist, index) in playlists" :key="index">
			<td scope="row">{{ index + 1 }}</td>
			<td><img :src="'../static/images/' + playlist.album_id + '.jpeg'" style="width:100px; height:100px; border-radius: 25px;">&nbsp;&hairsp;</td>
			<td><router-link :to="'/user/playlist/' + playlist.playlist_id"><p>{{playlist.playlist_name}}</p></router-link</td>
		</tr>
	  </table>
	</div>

	<div class="modal" tabindex="-1" role="dialog" id="playlistModal">
	  <div class="modal-dialog" role="document">
	    <div class="modal-content">
	      <div class="modal-header">
	        <h5 class="modal-title">Create New Playlist?</h5>
	        <button @click="closeModal($event)" type="button" class="close" data-dismiss="modal" aria-label="Close">
	          <span aria-hidden="true">&times;</span>
	        </button>
	      </div>
	      <form method="POST" @submit.prevent="submit_playlist($event)">
	      <div class="modal-body">
	        Enter Playlist Name:&nbsp;&nbsp;<input id="playlist_name" type="text" required>
	      </div>
	      <div class="modal-footer">
		    <button type="submit" class="btn btn-primary">Save changes</button>
		    <button @click="closeModal($event)" type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
	      </form>
	      </div>
	    </div>
	  </div>
	</div>

	<div class="card text-center">
	  <div class="card-footer">Contact Us: 21f1001736@ds.study.iitm.ac.in</div>
	</div>
	</div>
`,

	data() {
		return {
			message: localStorage.getItem('message'),
		    token: null,
			user_id: localStorage.getItem('user_id'),
			role: null,
     		dropdown: false,
     		playlists: null,
     		user: null,
     		flag: null,
		}
	},

	methods: {
		search(){
		 	router.push({
	    		name: 'search',
				query: { search: document.querySelector('#search_form input[type="text"]').value, }
    		});
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
			this.message = false;
		},

		create_playlist(event){
	    	const modal = document.getElementById('playlistModal');
	        // Show the modal
	        if (modal) {
	            modal.classList.add('show');
	            modal.style.display = 'block';
	            document.body.classList.add('modal-open');
	            modal.setAttribute('aria-modal', 'true');
	  		}
		},

		async submit_playlist(event){
	  		const queryParams = new URLSearchParams({
			    song_id: this.song_id,
			    playlist_name: document.querySelector('#playlistModal input[type="text"]').value,
			    user_id: this.user_id,
			    token: this.token,
			});

			const res = await fetch(`/api/user/playlist?${queryParams}`, {
		        method: 'POST',
		    });

		    const result = await res.json();
			if (result.status_code === 200) {
				localStorage.setItem("message", "Playlist created successfully!");
				location.reload();
		  	} else {
		  		localStorage.setItem("message", result.message);
		  		location.reload();
		  	}
		},

		closeModal(event) {
	    	location.reload();
		},

		async change_flag() {
			const queryParams = new URLSearchParams({
			    user_id: this.user_id,
			    flag: this.flag,
			    token: this.token,
			});

			const res = await fetch(`/api/user/flag?${queryParams}`, {
		        method: 'POST',
		    });
			location.reload()
		}
	},

	async created() {
    	document.title = 'Profile';

    	const response = await fetch(`/api/redis/get/${this.user_id}`);
	    const data = await response.json();
	    if (data.data) {
	    	this.token = data.data.token;
	    	this.role = data.data.role;
	    }

    	if (this.token && (this.role == 'User' || this.role == 'Creator')) {
    		const queryParams = new URLSearchParams({
			    user_id: this.user_id,
			    token: this.token
			});

			const res = await fetch(`/api/signup?${queryParams}`, {
		        method: 'GET',
		    });
		    const result = await res.json();
			if (result.status_code === 200 && result.message === 'Retrieval Successful') {
				this.playlists = result.playlists;
				this.user = result.user;
				this.flag = result.flag;
			}
  		} else if (this.token && this.role == 'Admin') {
  			router.push({
	    		name: 'admin_home',
				query: { auth: true }
    		});
  		} else {
  			router.push({
	    		name: 'user_login',
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
		style.href = '/css/view_creator_profile.css';
		document.head.appendChild(style);

		localStorage.removeItem("message")
	}
}

export default user_profile