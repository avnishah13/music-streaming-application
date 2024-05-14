import { createApp } from 'vue';
import { ref } from 'vue';
import router from '/static/js/router.js';

const user_home = {
	template: `
	<div id="app">
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
	</nav><br>

	<div class="row" style="margin-left: 0px;">
	<b><p v-if="playlist_history.length !== 0" style="font-size: 35px; margin-left: 18px; text-align: center;">Jump Back In</p></b>
	<template v-for="playlist in playlist_history" :key="playlist.playlist_id">
	 	<template v-for="album in albums" :key="album.album_id">
	    <div v-if="playlist.playlist_id == album.playlist_id" class="column" style="margin-left: 10px;"> 
	      &nbsp;&nbsp;<router-link :to="'/user/playlist/' + album.playlist_id"><img :src="'../static/images/' + album.album_id + '.jpeg'" style="width:200px; height:200px; border-radius: 25px;"></router-link>
	      <figcaption style="text-align: center;">{{album.album_name}}</figcaption><br><br>
	    </div>
	  	</template>
	</template>

	<template v-for="song in songs" :key="song.song_id">
	    <div v-if="psongs.indexOf(song.song_id) !== -1 " class="column" style="margin-left: 10px;">
	      &nbsp;&nbsp;<router-link :to="'/user/playlist/' + song_playlists[song.song_id][1]"><img :src="'../static/images/' + song.album_id + '.jpeg'" style="width:200px; height:200px; border-radius: 25px;"></router-link>
	      <figcaption style="text-align: center;">{{song_playlists[song.song_id][0]}}</figcaption><br><br>
	    </div>
	</template>
	</div>

	<div class="row" style="margin-left: 0px;">
	<b><p v-if="user_playlists.length !== 0" style="font-size: 35px; margin-left: 18px; text-align: center;">Your Playlists</p></b>
	<template v-for="playlist in user_playlists" :key="playlist.playlist_id">
	    <div class="column" style="margin-left: 10px;"> 
	      &nbsp;&nbsp;<router-link :to="'/user/playlist/' + playlist.playlist_id"><img :src="'../static/images/' + playlist.album_id + '.jpeg'" style="width:200px; height:200px; border-radius: 25px;"></router-link>
	      <figcaption style="text-align: center;">{{playlist.playlist_name}}</figcaption><br><br>
	    </div>
	</template>
	</div>

	<b><p style="font-size: 35px; margin-left: 18px; text-align: center;">Today's biggest hits</p></b>
	<div class="row" style="margin-left: 0px;">
	  <div class="column" style="margin-left: 10px;">
	    &nbsp;&nbsp;<router-link to="/user/top_playlists/todays_top_hits"><img :src="'../static/images/' + top_song.album_id + '.jpeg'" style="width:200px; height:200px; border-radius: 25px;"></router-link>
	    <figcaption style="text-align: center;">Today's top hits</figcaption><br><br>
	  </div>

	  <div class="column" style="margin-left: 10px;"> 
	  &nbsp;&nbsp;<router-link to="/user/top_playlists/pop_shots"><img :src="'../static/images/' + con.p_1 + '.jpeg'" style="width:200px; height:200px; border-radius: 25px;"></router-link>
	  <figcaption style="text-align: center;">Pop Shots</figcaption><br><br>
	  </div>
	</div>

	<div class="row" style="margin-left: 0px;">
	<b><p style="font-size: 35px; margin-left: 18px; text-align: center;">Genre Mixes</p></b>
	<template v-for="(value, key) in con" :key="key">
	    <div v-if="value != null" class="column" style="margin-left: 10px;">
	      &nbsp;&nbsp;<router-link :to="'/user/top_playlists/' + key"><img :src="'../static/images/' + value + '.jpeg'" style="width:200px; height:200px; border-radius: 25px;"></router-link>
	      <figcaption style="text-align: center;">{{playlist_names[key]}}</figcaption><br><br>
	    </div>
	</template>

	<div class="row" style="margin-left: 0px;">
	<b><p style="font-size: 35px; margin-left: 18px; text-align: center;">Bestselling Albums Today</p></b>
	<template v-for="album in top_albums" :key="album.album_id">
	    <div class="column" style="margin-left: 10px;"> 
	      &nbsp;&nbsp;<router-link :to="'/user/playlist/' + album.playlist_id"><img :src="'../static/images/' + album.album_id + '.jpeg'" style="width:200px; height:200px; border-radius: 25px;"></router-link>
	      <figcaption style="text-align: center;">{{album.album_name}}</figcaption><br><br>
	    </div>
	</template>
	</div>
	</div>

	<div class="row" style="margin-left: 0px;">
	<b><p style="font-size: 35px; margin-left: 18px; text-align: center;">Chartbuster Artists</p></b>
	<template v-for="creator in top_creators" :key="creator.creator_id">
	    <div class="column" style="margin-left: 10px;"> 
	      &nbsp;&nbsp;<router-link v-if="creator.profile" :to="'/user/creator_profile/' + creator.creator_id"><img :src="'../static/creator_profiles/' + creator.creator_id + '.jpeg'" style="width:200px; height:200px; border-radius: 25px;"></router-link>
	      &nbsp;&nbsp;<router-link v-else :to="'/user/creator_profile/' + creator.creator_id"><img src="../static/creator_profiles/default.jpeg" style="width:200px; height:200px; border-radius: 25px;"></router-link>
	      <figcaption style="text-align: center;">{{creator.creator_name}}</figcaption><br><br>
	    </div>
	</template>
	</div>

	<b><p style="font-size: 35px; margin-left: 18px; text-align: center;">Regional Hits</p></b>
	<div class="row" style="margin-left: 0px;"> 
	  <div v-if="hot_hindi" class="column" style="margin-left: 10px;">
	    &nbsp;&nbsp;<router-link to="/user/top_playlists/hot_hindi"><img :src="'../static/images/' + hot_hindi + '.jpeg'" style="width:200px; height:200px; border-radius: 25px;"></router-link>
	    <figcaption style="text-align: center;">Hot Hindi</figcaption><br><br>
	  </div>

	  <div v-if="eclectic_english" class="column" style="margin-left: 10px;">
	    &nbsp;&nbsp;<router-link to="/user/top_playlists/eclectic_english"><img :src="'../static/images/' + eclectic_english + '.jpeg'" style="width:200px; height:200px; border-radius: 25px;"></router-link>
	    <figcaption style="text-align: center;">Eclectic English</figcaption><br><br>
	  </div>

	  <div v-if="sizzling_spanish" class="column" style="margin-left: 10px;"> 
	    &nbsp;&nbsp;<router-link to="/user/top_playlists/sizzling_spanish"><img :src="'../static/images/' + sizzling_spanish + '.jpeg'" style="width:200px; height:200px; border-radius: 25px;"></router-link>
	    <figcaption style="text-align: center;">Sizzling Spanish</figcaption><br><br>
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
		    auth: this.$route.query.auth,
		    message: localStorage.getItem('message'),
		    token: null,
			user_id: localStorage.getItem('user_id'),
			role: null,
     		dropdown: false,
     		top_song: {},
     		con: {},
     		playlist_names: {},
     		top_albums: {},
     		top_creators: {},
     		hot_hindi: null,
     		eclectic_english: null,
     		sizzling_spanish: null,
     		playlist_history: {},
     		songs: {},
     		albums: {},
     		song_playlists: {},
     		psongs: [],
     		user_playlists: [],
     		flag: null,
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

		search(){
		 	router.push({
	    		name: 'search',
				query: { search: document.querySelector('#search_form input[type="text"]').value, }
    		});
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

		closeModal(event) {
	    	location.reload();
		},
	},

	async created() {
    	document.title = 'User Home';

    	const response = await fetch(`/api/redis/get/${this.user_id}`);
    	const data = await response.json();
    	if (data.data) {
	    	this.token = data.data.token;
	    	this.role = data.data.role;
	    }
    	
    	if (this.token && (this.role == 'User' || this.role == 'Creator')) {
    		const queryParams = new URLSearchParams({
			    user_id: this.user_id,
			    token: this.token,
			});
			const res = await fetch(`/api/user?${queryParams}`, {
		        method: 'GET',
		    });
		    const result = await res.json();
			if (result.status_code === 200 && result.message === 'Retrieval Successful') {
				this.top_song = result.top_song;
	     		this.con = result.con;
	     		this.playlist_names = result.playlist_names;
	     		this.top_albums = result.top_albums;
	     		this.top_creators = result.top_creators;
	     		this.hot_hindi = result.hot_hindi;
	     		this.eclectic_english = result.eclectic_english;
	     		this.sizzling_spanish = result.sizzling_spanish;
	     		this.playlist_history = result.playlist_history;
	     		this.songs = result.songs;
	     		this.albums = result.albums;
	     		this.song_playlists = result.song_playlists;
	     		this.psongs = result.psongs;
	     		this.user_playlists = result.user_playlists;
	     		this.flag = result.flag;
	     		console.log(this.flag)
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

export default user_home