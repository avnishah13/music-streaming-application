import { createApp } from 'vue';
import { ref } from 'vue';
import router from '/static/js/router.js';

const creator_profile = {
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
	        	<button v-if="flag !== 0" class="dropdown-item" @click="change_flag($event)">Hide Flagged Content</button>
	      		<button v-else="flag == 0" class="dropdown-item" @click="change_flag($event)">View Flagged Content</button>
	      		<router-link v-if="role == 'Creator'" class="dropdown-item" to="/creator">Switch to Creator Profile</router-link>
	      		<router-link v-if="role == 'User'" class="dropdown-item" to="/creator/signup">Switch to Creator Profile</router-link>
          		<router-link class="dropdown-item" to="/log-out">Logout</router-link>
	        </div>
	      </div>
	    </ul>
	    </div>
	  </div>
	</nav><br>

	<div class="parent">
	  <img :src="'../static/creator_profiles/' + creator.creator_id + '.jpeg'"></img>
	  <h1 style="float:left; padding-top: 60px; padding-bottom: 25px; font-family: Copperplate, Papyrus, fantasy;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{creator.creator_name}}</h1>
	</div><br><br>

	<h1>Popular</h1><br>
	<div>
	  <table class="table table-hover">
	      <tr v-for="(song, index) in songs" :key="index">
	        <td></td>
	        <td scope="row">{{ index + 1 }}</td>
	        <td><img :src="'../static/images/' + song.album_id + '.jpeg'" style="width:100px; height:100px; border-radius: 25px;">&nbsp;&hairsp;</td>
	        <td><h5>{{song.song_name}}</h5></td>
	        <td v-if="song.plays == null">0</td>
	        <td v-if="song.plays != null">{{song.plays}}</td>
	        <td>
	          <audio ref="audioElements" @click="playSong(index, song.song_id);" @play="increase_plays($event, song.song_id)" @pause="set_flag($event, song.song_id)" @ended="playNext(index, song.song_id)" preload="auto" controls="controls" autobuffer>
	            <source :src="'../static/audio/' + song.song_id + '.mp3'" type="audio/mpeg">
	            Your browser does not support the audio element.
	          </audio>
	        </td>
	        <td>
			<router-link :to="'/song/' + song.song_id + '/lyrics'"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-music-note-list" viewBox="0 0 16 16"><path d="M12 13c0 1.105-1.12 2-2.5 2S7 14.105 7 13s1.12-2 2.5-2 2.5.895 2.5 2"/><path fill-rule="evenodd" d="M12 3v10h-1V3z"/><path d="M11 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 16 2.22V4l-5 1z"/><path fill-rule="evenodd" d="M0 11.5a.5.5 0 0 1 .5-.5H4a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5m0-4A.5.5 0 0 1 .5 7H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5m0-4A.5.5 0 0 1 .5 3H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5"/></svg></router-link>
			</td>
			<td>
			<button role="button" @click="show_options($event, index)" type="button" class="btn dropdown" to="#" data-bs-toggle="dropdown" id="dropdownMenu2" aria-haspopup="true" aria-expanded="false"> 
			    <span><svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" fill="currentColor" class="bi bi-three-dots" viewBox="0 0 16 16"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/></svg></span>
			</button>
			<div :id="'option' + index" class="dropdown-menu pull-left" aria-labelledby="dropdownMenu2" style="background-color: #202020; left: 85%;">
		    	<router-link class="dropdown-item" :to="'/user/playlist/' + song.playlist_id" style="text-align: left">Go to Album</router-link>
	        	<button @click="create_rating($event, song.song_id)" class="dropdown-item" style="text-align: left;">Rate Song</button>
	        	<button class="dropdown-item" style="font-size: 15px; text-align: left; text-transform: none;" role="button" @click="add_to_playlist($event, index)" type="button" class="btn dropdown" to="#" data-bs-toggle="dropdown" id="dropdownMenu2" aria-haspopup="true" aria-expanded="false">
		  			Add to Playlist&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▷
		  		</button>
		  		<div :id="'playlist' + index" class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenu2" style="background-color: #202020; left: -82%; top: 90px;">
		  			<button @click="create_playlist($event, song.song_id)" class="dropdown-item">New Playlist</button>
		        	<template v-for="playlist in playlists" :key="playlist.playlist_id">
		        		<button @click="add_song($event, playlist.playlist_id, song.song_id)" class="dropdown-item">{{playlist.playlist_name}}</button>
		        	</template>
		    	</div>
		    </div>
			</td>
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

	<div class="modal" tabindex="-1" role="dialog" id="ratingModal">
	  <div class="modal-dialog" role="document">
	    <div class="modal-content">
	      <div class="modal-header">
	        <h5 class="modal-title">Rate Song</h5>
	        <button @click="closeModal($event)" type="button" class="close" data-dismiss="modal" aria-label="Close">
	          <span aria-hidden="true">&times;</span>
	        </button>
	      </div>
	      <form method="POST" @submit.prevent="submit_rating($event)">
	      <div class="modal-body">
	        Enter your rating:&nbsp;&nbsp;<input id="rating" type="number" max="5" min="1" required>
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
	</div>`,

	data() {
		return {
		    token: null,
			user_id: localStorage.getItem('user_id'),
			role: null,
			creator_id: this.$route.params.creator_id,
			creator: {},
			plays: null,
			songs: {},
			message:localStorage.getItem('message'),
			playlists: [],
			flag : null,
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
			this.auth = false;
     		this.delete_message = false;
     		this.message = false;
		},

		show_options(event, index) {
			const element = document.getElementById("option" + index);
			const secondary_element = document.getElementById("drop" + index);
			if (this.option) {
				element.classList.remove("show");
				secondary_element.classList.remove("show");
				this.option = false;
				this.drop = false;
			} else {
				element.classList.add("show");
				this.option = true;
			}
		},

		add_to_playlist(event, index) {
			const element = document.getElementById("playlist" + index);
			if (this.playlist) {
				element.classList.remove("show");
				this.playlist = false;
			} else {
				element.classList.add("show");
				this.playlist = true;
			}
		},

		playSong(index, song_id) {
	      const audioElements = this.$refs.audioElements;
	      audioElements.forEach((audio, i) => {
	        if (i === index) {
	          audio.play();
	        } else {
	          audio.pause();
	          audio.currentTime = 0;
	        }
	      });
	    },
	    playNext(index, song_id) {
	      const nextIndex = index + 1;
	      if (nextIndex < this.songs.length) {
	        this.playSong(nextIndex);
	        this.pause[song_id] = false
	      }
	  	},

	  	async add_song(event, playlist_id, song_id){
	  		const queryParams = new URLSearchParams({
			    song_id: song_id,
			    playlist_id: playlist_id,
			    token: this.token,
			});

			const res = await fetch(`/api/user/playlist?${queryParams}`, {
		        method: 'PUT',
		    });

		    const result = await res.json();
			if (result.status_code === 200) {
				localStorage.setItem("message", "Song added successfully!");
				location.reload()
		  	} else {
		  		localStorage.setItem("message", result.message);
				location.reload()
		  	}
		  },

	  	create_playlist(event, song_id){
	  		this.song_id = song_id;
	    	this.new_playlist = true;
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
				this.add_song(event, result.playlist_id, this.song_id);
				localStorage.setItem("message", "Playlist created successfully!");
				location.reload();
		  	} else {
		  		localStorage.setItem("message", result.message);
		  		location.reload();
		  	}
		 },

		create_rating(event, song_id) {
	  		this.song_id = song_id;
	    	const modal = document.getElementById('ratingModal');
	        if (modal) {
	            modal.classList.add('show');
	            modal.style.display = 'block';
	            document.body.classList.add('modal-open');
	            modal.setAttribute('aria-modal', 'true');
		  	}
		},

		async submit_rating(event) {
	  		const queryParams = new URLSearchParams({
			    song_id: this.song_id,
			    rating: document.querySelector('#ratingModal input[type="number"]').value,
			    token: this.token,
			});

			const res = await fetch(`/api/user/rating?${queryParams}`, {
		        method: 'POST',
		    });

		    const result = await res.json();
			if (result.status_code === 200) {
				localStorage.setItem("message", "Rating updated successfully!");
				location.reload();
		  	} else {
		  		localStorage.setItem("message", result.message);
		  		location.reload();
		  	}
		},

		increase_plays(event, song_id) {
			if (this.pause[song_id] == true) {
				this.pause[song_id] = false
			} else {
				console.log("Hi")
				const queryParams = new URLSearchParams({
				    song_id: song_id,
				});

				fetch(`/api/user/plays?${queryParams}`, {
			        method: 'POST',
			    });
			}
		},

		set_flag(event, song_id) {
			this.pause[song_id] = true;
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
    	document.title = 'Artist Profile';

    	const response = await fetch(`/api/redis/get/${this.user_id}`);
	    const data = await response.json();
	    if (data.data) {
	    	this.token = data.data.token;
	    	this.role = data.data.role;
	    }
    	
    	if (this.token && (this.role == 'Creator' || this.role == 'User')) {
    		const queryParams = new URLSearchParams({
			    creator_id: this.creator_id,
			    user_id: this.user_id,
			    token: this.token,
			});

			const res = await fetch(`/api/creator/signup?${queryParams}`, {
		        method: 'GET',
		    });
		    const result = await res.json();
			if (result.status_code === 200) {
				this.creator = result.creator;
				this.plays = result.plays;
				this.songs = result.songs;
				this.playlists = result.playlists;
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

		localStorage.removeItem('message');
	}
}

export default creator_profile