import { createApp } from 'vue';
import { ref } from 'vue';
import router from '/static/js/router.js';

const collab_requests = {
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

	<div v-if="received_collabs.length !== 0">
	<h1>Pending Requests</h1><br>
	<table class="table table-hover">
	  <tr>
	    <th style="width:35%">Song Name</th>
	    <th style="width:35%">Collab Requester</th>
	    <th style="width:30%">Actions</th>
	  </tr>
	  <tr v-for="collab in received_collabs" :key="collab.collab_id">
	    <td>{{collab.song_name}}</td>
	    <td>{{collab.creator_name}}</td>
	    <td>
	      <button class="btn btn-primary" @click="accept(collab.collab_id)" name="action" value="Accept"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-check" viewBox="0 0 16 16"><path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/></svg></button>&nbsp;&nbsp;
	      <button class="btn btn-primary" @click="reject(collab.collab_id)" name="action" value="Reject"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/></svg></button>
	    </td>
	    </form>
	  </tr>
	</table><br>
	</div>

	<div v-if="sent_collabs.length !== 0">
	<h1>Sent Requests</h1><br>
	<table class="table table-hover">
	  <tr>
	    <th style="width:35%">Song Name</th>
	    <th style="width:35%">Collab Requester</th>
	    <th style="width:30%">Actions</th>
	  </tr>
	  <tr v-for="collab in sent_collabs" :key="collab.collab_id">
	    <td>{{collab.song_name}}</td>
	    <td>{{collab.creator_name}}</td>
	    <td>
	      <button class="btn btn-primary" @click="reject(collab.collab_id)" name="action" value="Reject"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/></svg></button>
	    </td>
	    </form>
	  </tr>
	</table><br>

	</div>

	<div class="box" v-if="sent_collabs.length === 0 && received_collabs.length === 0">
	  <h2 style="text-align: center;"><br><br><br><br><br>You have no pending collaboration requests!</h2><br><br><br><br><br><br><br><br>
	</div>

	<div class="card text-center">
	  <div class="card-footer">Contact Us: 21f1001736@ds.study.iitm.ac.in</div>
	</div>`,

	data() {
		return {
		    token: null,
			user_id: localStorage.getItem('user_id'),
			role: null,
			creator_id: null,
			received_collabs: [],
			sent_collabs: [],
			message: localStorage.getItem('message'),
		}
	},

	methods: {
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
			this.auth = false;
     		this.delete_message = false;
     		this.message = false;
		},

		async accept(collab_id) {
			const formData = {
		        collab_id: collab_id,
		        action: 'Accept',
		        token: this.token,
		    };

		    const res = await fetch('/api/creator/collaboration', {
		        method: 'POST',
		        headers: { 'Content-Type': 'application/json' },
		        body: JSON.stringify(formData)
		    });
		    const result = await res.json();

			if (result.status_code === 200) {
				localStorage.setItem('message', 'Collaboration request rejected!')
				location.reload()
			}
		},

		async reject(collab_id) {
			const formData = {
		        collab_id:collab_id,
		        action: 'Reject'
		    };

		    const res = await fetch('/api/creator/collaboration', {
		        method: 'POST',
		        headers: { 'Content-Type': 'application/json' },
		        body: JSON.stringify(formData)
		    });
		    const result = await res.json();

			if (result.status_code === 200) {
				localStorage.setItem('message', 'Collaboration request rejected!')
				location.reload()
			}
		},
	},

	async created() {
    	document.title = 'Collab Requests';

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

			const res = await fetch(`/api/creator/collaboration?${queryParams}`, {
		        method: 'GET',
		    });
		    const result = await res.json();
			if (result.status_code === 200) {
				this.received_collabs = result.received_collabs;
				this.sent_collabs = result.sent_collabs;

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
		style.href = '/css/creator_profile.css';
		document.head.appendChild(style);

		localStorage.removeItem('message');
	}
}

export default collab_requests