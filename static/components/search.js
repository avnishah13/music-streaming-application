import { createApp } from 'vue';
import { ref } from 'vue';
import router from '/static/js/router.js';

const search = {
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
	      <form @submit.prevent="submit" class="d-flex" id="search_form">
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

	<div v-if="songs.length == 0 && albums.length == 0 && playlists.length == 0 && creators.length == 0">
	<h1>No Results Found!</h1><br>
	<p style="text-align:center">Please try searching for something else!
	<router-link to="/user" style="text-align:center">Go Back</router-link<br><br>
	</div>

	<div v-if="songs.length !== 0" class="row" style="margin-left: 0px;">
	<b><p style="font-size: 35px; margin-left: 18px; text-align: center;">Songs&nbsp;<a @click="song_filters($event)"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-funnel" viewBox="0 0 16 16"><path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2z"/></svg></a></p></b>
		<div id="song_dropdowns" class="dropdown-menu pull-left" aria-labelledby="dropdownMenu1" style="width:300px; left:57%;">
        	<button class="dropdown-item" @click="genre_filter($event)">Filter by Genre</button>
        	<div id="genre_dropdown" class="dropdown-menu pull-left" aria-labelledby="dropdownMenu1" style="width:300px;">
	        	<template v-for="genre in genres" :key="genre.genre_id">
	        		<button class="dropdown-item" @click="submit_genre_filter(genre.genre_id)">{{genre.genre_name}}</button>
	        	</template>
	        </div>
        	<button class="dropdown-item" @click="rating_filter($event)">Filter by Rating</button>
        	<div id="rating_dropdown" class="dropdown-menu pull-left" aria-labelledby="dropdownMenu1" style="width:300px;">
	        	<button class="dropdown-item" @click="submit_rating_filter(1)">Above 1★</button>
	        	<button class="dropdown-item" @click="submit_rating_filter(2)">Above 2★</button>
	        	<button class="dropdown-item" @click="submit_rating_filter(3)">Above 3★</button>
	        	<button class="dropdown-item" @click="submit_rating_filter(4)">Above 4★</button>
	        </div>
        </div>
		<div class="column" v-for="song in songs" :key="song.song_id">
	      &nbsp;&nbsp;<router-link :to="'/user/playlist/' + song.playlist_id"><img :src="'../static/images/' + song.album_id + '.jpeg'" style="width:200px; height:200px; border-radius: 25px;"></router-link>
	      <figcaption style="text-align: center;">{{song.song_name}}</figcaption><br><br>
	    </div>
	</div>

	<div v-if="albums.length !== 0" class="row" style="margin-left: 0px;">
	<b><p style="font-size: 35px; margin-left: 18px; text-align: center;">Albums&nbsp;<a @click="creator_filter($event)"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-funnel" viewBox="0 0 16 16"><path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2z"/></svg></a></p></b>
		<div id="creator_dropdown" class="dropdown-menu pull-left" aria-labelledby="dropdownMenu1" style="width:300px; left:58%;">
        	<p class="dropdown-item">Filter by Artist</p>
        	<template v-for="creator in all_creators" :key="creator.creator_id">
        		<button class="dropdown-item" @click="submit_creator_filter(creator.creator_id)" :value="creator.creator_id">{{creator.creator_name}}</button>
        	</template>
        </div>
		<div class="column" v-for="album in albums" :key="album.album_id">
	      &nbsp;&nbsp;<router-link :to="'/user/playlist/' + album.playlist_id"><img :src="'../static/images/' + album.album_id + '.jpeg'" style="width:200px; height:200px; border-radius: 25px;"></router-link>
	      <figcaption style="text-align: center;">{{album.album_name}}</figcaption><br><br>
	    </div>
	</div>

	<div v-if="creators.length !== 0" class="row" style="margin-left: 0px;">
	<b><p style="font-size: 35px; margin-left: 18px; text-align: center;">Creators</p></b>
		<div class="column" v-for="creator in creators" :key="creator.creator_id">
	      &nbsp;&nbsp;<router-link :to="'/user/creator_profile/' + creator.creator_id"><img :src="'../static/creator_profiles/' + creator.creator_id + '.jpeg'" style="width:200px; height:200px; border-radius: 25px;"></router-link>
	      <figcaption style="text-align: center;">{{creator.creator_name}}</figcaption><br><br>
	    </div>
	</div>

	<div v-if="playlists.length !== 0" class="row" style="margin-left: 0px;">
	<b><p style="font-size: 35px; margin-left: 18px; text-align: center;">Playlists</p></b>
		<div class="column" v-for="playlist in playlists" :key="playlist.playlist_id">
	      &nbsp;&nbsp;<router-link :to="'/user/playlist/' + playlist.playlist_id"><img :src="'../static/images/' + playlist.album_id + '.jpeg'" style="width:200px; height:200px; border-radius: 25px;"></router-link>
	      <figcaption style="text-align: center;">{{playlist.playlist_name}}</figcaption><br><br>
	    </div>
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
			search: this.$route.query.search,
     		dropdown: false,
     		songs: null,
     		albums: null,
     		playlists: null,
     		creators: null,
     		flag: null,
     		all_creators: null,
     		creator_id: localStorage.getItem('creator_id'),
     		genres: null,
     		genre_id: localStorage.getItem('genre_id'),
     		rating: localStorage.getItem('rating')
		}
	},

	methods: {
		submit(){
		 	localStorage.setItem('search', document.querySelector('#search_form input[type="text"]').value);
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
		},

		creator_filter(event) {
			const element = document.getElementById("creator_dropdown");
			if (this.dropdown) {
				element.classList.remove("show");
				this.dropdown = false;
			} else {
				element.classList.add("show");
				this.dropdown = true;
			}
		},

		submit_creator_filter(creator_id){
		 	localStorage.setItem('creator_id', creator_id);
		 	location.reload();
		},

		song_filters(event) {
			const element = document.getElementById("song_dropdowns");
			if (this.dropdown) {
				element.classList.remove("show");
				this.dropdown = false;
			} else {
				element.classList.add("show");
				this.dropdown = true;
			}
		},

		genre_filter(event) {
			const element = document.getElementById("genre_dropdown");
			if (this.dropdown) {
				element.classList.remove("show");
				this.dropdown = false;
			} else {
				element.classList.add("show");
				this.dropdown = true;
			}
		},

		submit_genre_filter(genre_id){
		 	localStorage.setItem('genre_id', genre_id);
		 	location.reload();
		},

		rating_filter(event) {
			const element = document.getElementById("rating_dropdown");
			if (this.dropdown) {
				element.classList.remove("show");
				this.dropdown = false;
			} else {
				element.classList.add("show");
				this.dropdown = true;
			}
		},

		submit_rating_filter(rating){
		 	localStorage.setItem('rating', rating);
		 	location.reload();
		},
	},

	async created() {
    	document.title = 'Search Results';

    	const response = await fetch(`/api/redis/get/${this.user_id}`);
	    const data = await response.json();
	    if (data.data) {
	    	this.token = data.data.token;
	    	this.role = data.data.role;
	    }

    	if (localStorage.getItem('search') != null) {
    		this.search = localStorage.getItem('search')
    		localStorage.removeItem('search')
    	}

    	if (localStorage.getItem('creator_id') != null) {
    		localStorage.removeItem('creator_id')
    	}

    	if (localStorage.getItem('genre_id') != null) {
    		localStorage.removeItem('genre_id')
    	}

    	if (localStorage.getItem('rating') != null) {
    		localStorage.removeItem('rating')
    	}

    	if (this.token && (this.role == 'User' || this.role == 'Creator')) {
    		const queryParams = new URLSearchParams({
			    search: this.search,
			    user_id: this.user_id,
			    creator_id: this.creator_id,
			    genre_id: this.genre_id,
			    rating: this.rating,
			    token: this.token,
			});
			const res = await fetch(`/api/user/search?${queryParams}`, {
		        method: 'GET',
		    });
		    const result = await res.json();
			if (result.status_code === 200 && result.message === 'Retrieval Successful') {
				this.songs = result.songs;
				this.albums = result.albums;
				this.creators = result.creators;
				this.playlists = result.playlists;
				this.flag = result.flag;
				this.all_creators = result.all_creators;
				this.genres = result.genres;
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
		style.href = '/css/user_home.css';
		document.head.appendChild(style);

		localStorage.removeItem("message")
	}
}

export default search