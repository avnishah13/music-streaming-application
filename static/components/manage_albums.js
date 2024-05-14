import { createApp } from 'vue';
import { ref } from 'vue';
import router from '/static/js/router.js';

const manage_albums = {
	template: `
	<div id="app">
	<div v-if="delete_message" aria-live="polite" aria-atomic="true" class="position-relative">
	  <div class="toast-container position-absolute top-0 end-0 p-3">
	    <div id="toast" class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
	      <div class="toast-header">
	        <strong class="me-auto">{{delete_message}}</strong>
	        <button type="button" @click="close_toast($event)" class="btn-close ms-2 mb-1" data-bs-dismiss="toast" aria-label="Close">
	          <span aria-hidden="true"></span>
	        </button>
	      </div>
	    </div>
	  </div>
	</div>

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

	  <h1>Manage Albums</h1><br>
	  <table class="table table-hover">
	    <tr>
	      <th style="width: 60%;"><h4>Album Name</h4></th>
	      <th><h4>Edit</h4></th>
	      <th><h4>Delete</h4></th>
	    </tr>
	    <tr v-for="album in albums" :key="album.album_id">
	      <td>{{album.album_name}}</td>
	      <td>
	        <router-link :to="album.album_id + '/edit'"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16"><path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708l-1.585-1.585z"/></svg></router-link>
	      </td>
	      <td>
	        <a href="javascript:void(0)" role="button" data-toggle="modal" @click="delete_album(album.album_id)"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg></a>
	      </td>
	    </tr>
	  </table>

	  <div class="modal" tabindex="-1" role="dialog" id="deleteModal">
	  <div class="modal-dialog" role="document">
	    <div class="modal-content">
	      <div class="modal-header">
	        <h5 class="modal-title">Confirm Deletion</h5>
	        <button @click="closeModal($event)" type="button" class="close" data-dismiss="modal" aria-label="Close">
	          <span aria-hidden="true">&times;</span>
	        </button>
	      </div>
	      <div class="modal-body">
	        <p style="text-align: left;">Are you sure you want to delete this album?</p>
	      </div>
	      <div class="modal-footer">
	        <form :action="'/creator/album/'+ album_id +'/delete'" @submit.prevent="submit" method="POST" id="create_album">
	        <button type="submit" class="btn btn-primary">Save changes</button>
	        <button @click="closeModal($event)" type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
	        </form>
	      </div>
	    </div>
	  </div>
	</div>
	</div><br>

	<div class="card text-center">
	  <div class="card-footer">Contact Us: 21f1001736@ds.study.iitm.ac.in</div>
	</div>`,

	data() {
		return {
		    token: null,
			user_id: localStorage.getItem('user_id'),
			role: null,
			creator_id: null,
			album_id: null,
			albums: [],
			delete_message: localStorage.getItem('delete_message'),
			message: this.$route.query.message,
		}
	},

	methods: {
		async submit(){
			const queryparams = new URLSearchParams({
			    album_id: this.album_id,
			    token: this.token,
			});

		    const res = await fetch(`/api/creator/album?${queryparams}`, {
		        method: 'delete',
		    });
		    const result = await res.json();

			if (result.status_code === 200) {
				localStorage.setItem('delete_message', "Album Deleted Successfully");
	    		location.reload()
		    }
		},

		delete_album(album_id) {
	    	this.album_id = album_id;
	    	const modal = document.getElementById('deleteModal');
	        // Show the modal
	        if (modal) {
	            modal.classList.add('show');
	            modal.style.display = 'block';
	            document.body.classList.add('modal-open');
	            modal.setAttribute('aria-modal', 'true');
	        }
	    },


	    closeModal(event) {
	    	location.reload();
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
			this.delete_message = false;
			this.message = false;
		}
	},

	async created() {
    	document.title = 'Manage Albums';

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

			const res = await fetch(`/api/creator/album?${queryParams}`, {
		        method: 'GET',
		    });
		    const result = await res.json();
			if (result.status_code === 200 && result.message === 'Retrieval Successful') {
				this.albums = result.albums;
			} else if (result.message === 'No Albums') {
		    	router.push({
		    		name: 'new_creator_home'
	    		});
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

		localStorage.removeItem('delete_message');
	}
}

export default manage_albums