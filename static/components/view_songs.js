import { createApp } from 'vue';
import { ref } from 'vue';
import router from '/static/js/router.js';

const view_songs = {
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
	</nav><br><br>

	<h1>All Songs</h1><br>
	<table class="table table-hover">
	      <tr v-for="song in songs" :key="song.song_id">
	      <td><h5>{{song.song_name}}</h5></td>
	      <td>
	        <audio preload="auto" controls="controls" autobuffer>
	          <source :src="'../static/audio/' + song.song_id + '.mp3'" type="audio/mpeg">
	          Your browser does not support the audio element.
	        </audio>
	      </td>
	      <td>
	        <router-link :to="'/song/' + song.song_id + '/lyrics'"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-music-note-list" viewBox="0 0 16 16"><path d="M12 13c0 1.105-1.12 2-2.5 2S7 14.105 7 13s1.12-2 2.5-2 2.5.895 2.5 2"/><path fill-rule="evenodd" d="M12 3v10h-1V3z"/><path d="M11 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 16 2.22V4l-5 1z"/><path fill-rule="evenodd" d="M0 11.5a.5.5 0 0 1 .5-.5H4a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5m0-4A.5.5 0 0 1 .5 7H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5m0-4A.5.5 0 0 1 .5 3H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5"/></svg></router-link>
	      </td>
	      <td>
	        <a href="javascript:void(0)" role="button" data-toggle="modal" @click="delete_song(song.song_id)"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg></a>
	      </td>
	      <td>
	      	<a href="javascript:void(0)" role="button" data-toggle="modal" @click="flag_song(song.song_id, song.flag)"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-flag" viewBox="0 0 16 16"><path d="M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.314.464L14.5 8l.186.464-.003.001-.006.003-.023.009a12 12 0 0 1-.397.15c-.264.095-.631.223-1.047.35-.816.252-1.879.523-2.71.523-.847 0-1.548-.28-2.158-.525l-.028-.01C7.68 8.71 7.14 8.5 6.5 8.5c-.7 0-1.638.23-2.437.477A20 20 0 0 0 3 9.342V15.5a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 1 0v.282c.226-.079.496-.17.79-.26C4.606.272 5.67 0 6.5 0c.84 0 1.524.277 2.121.519l.043.018C9.286.788 9.828 1 10.5 1c.7 0 1.638-.23 2.437-.477a20 20 0 0 0 1.349-.476l.019-.007.004-.002h.001M14 1.221c-.22.078-.48.167-.766.255-.81.252-1.872.523-2.734.523-.886 0-1.592-.286-2.203-.534l-.008-.003C7.662 1.21 7.139 1 6.5 1c-.669 0-1.606.229-2.415.478A21 21 0 0 0 3 1.845v6.433c.22-.078.48-.167.766-.255C4.576 7.77 5.638 7.5 6.5 7.5c.847 0 1.548.28 2.158.525l.028.01C9.32 8.29 9.86 8.5 10.5 8.5c.668 0 1.606-.229 2.415-.478A21 21 0 0 0 14 7.655V1.222z"/></svg></a>
	      </td>
	      </tr>
	  </thead>
	</table><br>

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
	        <p style="text-align: left;">Are you sure you want to delete this song?</p>
	      </div>
	      <div class="modal-footer">
	        <form :action="'/creator/song/'+ song_id +'/delete'" method="POST" @submit.prevent="submit" id="create_album">
	        <button type="submit" class="btn btn-primary">Save changes</button>
	        <button @click="closeModal($event)" type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
	        </form>
	      </div>
	    </div>
	  </div>
	</div>

	<div class="modal" tabindex="-1" role="dialog" id="flagModal">
	  <div class="modal-dialog" role="document">
	    <div class="modal-content">
	      <div class="modal-header">
	        <h5 class="modal-title">FLag Song?</h5>
	        <button @click="closeModal($event)" type="button" class="close" data-dismiss="modal" aria-label="Close">
	          <span aria-hidden="true">&times;</span>
	        </button>
	      </div>
	      <div class="modal-body">
	        <div class="form-group">
	        <select class="form-select" id="flag" name="flag" style="text-align: center;">
	          <option value="Explicit Content">Explicit Content</option>
	          <option value="Spam or Misinformation">Spam or Misinformation</option>
	          <option value="Harassment or Abuse">Harassment or Abuse</option>
	          <option value="Copyright Infringement">Copyright Infringement</option>
	        </select>
	      </div><br>
	      </div>
	      <div class="modal-footer">
	        <form :action="'/creator/song/'+ song_id +'/delete'" method="POST" @submit.prevent="flag">
	        <button type="submit" class="btn btn-primary">Save changes</button>
	        <button @click="closeModal($event)" type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
	        </form>
	      </div>
	    </div>
	  </div>
	</div>

	<div class="modal" tabindex="-1" role="dialog" id="unflagModal">
	  <div class="modal-dialog" role="document">
	    <div class="modal-content">
	      <div class="modal-header">
	        <h5 class="modal-title">Unflag Song?</h5>
	        <button @click="closeModal($event)" type="button" class="close" data-dismiss="modal" aria-label="Close">
	          <span aria-hidden="true">&times;</span>
	        </button>
	      </div>
	      <div class="modal-body">
	        <div class="form-group">
	  		<p style="text-align: left;">Are you sure you want to unflag the song?</p>
	      </div><br>
	      </div>
	      <div class="modal-footer">
	        <form :action="'/creator/song/'+ song_id +'/delete'" method="POST" @submit.prevent="unflag">
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
	</div>`,

	data() {
		return {
		    auth: this.$route.query.auth,
		    song_id: "",
		    token: null,
			user_id: localStorage.getItem('user_id'),
			role: null,
			delete_message: localStorage.getItem('delete_message'),
			songs: [],
     		dropdown: false,
     		message:this.$route.query.message,
		}
	},

	methods: {
		async submit(){
			const queryparams = new URLSearchParams({
			    song_id: this.song_id,
			    token: this.token,
			});

		    const res = await fetch(`/api/creator/song?${queryparams}`, {
		        method: 'delete',
		    });
		    const result = await res.json();

			if (result.status_code === 200) {
				localStorage.setItem('delete_message', "Song Deleted Successfully");
	    		location.reload()
		    }
		},

		async flag(){
			const queryparams = new URLSearchParams({
			    song_id: this.song_id,
			    flag: document.getElementById('flag').value,
			    token: this.token,
			});

		    const res = await fetch(`/api/admin/flag?${queryparams}`, {
		        method: 'post',
		    });
		    const result = await res.json();

			if (result.status_code === 200) {
				localStorage.setItem('delete_message', "Song Flagged Successfully");
	    		location.reload()
		    }
		},

		async unflag(){
			const queryparams = new URLSearchParams({
			    song_id: this.song_id,
			    token: this.token,
			});

		    const res = await fetch(`/api/admin/flag?${queryparams}`, {
		        method: 'post',
		    });
		    const result = await res.json();

			if (result.status_code === 200) {
				localStorage.setItem('delete_message', "Song unflagged successfully");
	    		location.reload()
		    }
		},

		delete_song(song_id) {
	    	this.song_id = song_id;
	    	const modal = document.getElementById('deleteModal');
	        // Show the modal
	        if (modal) {
	            modal.classList.add('show');
	            modal.style.display = 'block';
	            document.body.classList.add('modal-open');
	            modal.setAttribute('aria-modal', 'true');
	        }
	    },

	    flag_song(song_id, flag) {
	    	this.song_id = song_id;
	    	let modal = null;	
	    	if (flag != null) {
	    		modal = document.getElementById('unflagModal');
	    	} else {
	    		modal = document.getElementById('flagModal');
	    	}
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
			this.auth = false;
     		this.delete_message = false;
     		this.message = false;
		},

		search(){
		 	router.push({
	    		name: 'admin_search',
				query: { search: document.querySelector('#search_form input[type="text"]').value, }
			});
		},
	},

	async created() {
    	document.title = 'View Songs';

    	const response = await fetch(`/api/redis/get/${this.user_id}`);
	    const data = await response.json();
	    if (data.data) {
	    	this.token = data.data.token;
	    	this.role = data.data.role;
	    }

    	if (this.token && this.role == 'Admin') {
    		const queryparams = new URLSearchParams({
			    token: this.token,
			});		
			const res = await fetch(`/api/creator?${queryparams}`, {
		        method: 'GET',
		    });
		    const result = await res.json();
			if (result.status_code === 200 && result.message === 'Retrieval Successful') {
				this.songs = result.songs
				console.log(this.songs)
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

		localStorage.removeItem('delete_message');
	}
}

export default view_songs