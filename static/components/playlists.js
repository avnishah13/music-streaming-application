import { createApp } from 'vue';
import { ref } from 'vue';
import router from '/static/js/router.js';

const playlists = {
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
	        	<button v-if="flagged" class="dropdown-item" @click="change_flag($event)">Hide Flagged Content</button>
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


	<div style="display: flex; align-items: center; justify-content: center;">
	<h1>{{header}}</h1>
	<button v-if="flag" role="button" @click="show_playlist_options($event, index)" type="button" class="btn dropdown" to="#" data-bs-toggle="dropdown" id="dropdownMenu2" aria-haspopup="true" aria-expanded="false">
	<span><svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" fill="currentColor" class="bi bi-three-dots" viewBox="0 0 16 16"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/></svg></span>
	</button>
	<div id="playlist_options" class="dropdown-menu pull-left" aria-labelledby="dropdownMenu2" style="background-color: #202020; left: 70%;">
    	<button @click="create_playlist($event, playlist_id)" class="dropdown-item">Edit</button>
    	<button @click="delete_playlist($event)" class="dropdown-item">Delete</button>
    </div>
    <button type="button" class="btn dropdown" @click="shuffle = !shuffle"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" :fill="[shuffle ? 'green' : 'white']" class="bi bi-shuffle" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.6 9.6 0 0 0 7.556 8a9.6 9.6 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.6 10.6 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.6 9.6 0 0 0 6.444 8a9.6 9.6 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5"/><path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192m0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192"/></svg></button>
	</div><br><br>
	<table class="table table-hover">
		<tr v-if="(songs.filter(song => song.flag === null).length !== 0 && flagged=='false') || (songs.length !== 0 && flagged)">
			<th>#</th>
			<th>Cover</th>
			<th>Title</th>
			<th>Audio</th>
			<th>Rating</th>
			<th>Album</th>
			<th>Lyrics</th>
			<th>Options</th>
		</tr>
		<template v-for="(song, index) in songs" :key="index">
		<tr v-if="song.flag === null || flagged">
			<td scope="row">{{ index + 1 }}</td>
			<td><img :src="'../static/images/' + song.album_id + '.jpeg'" style="height:100px; width:100px;"></td>
			<td><p style="font-size: 18px; vertical-align: center">{{song.song_name}}<br><p style="font-size: 12px">{{song.creator_name}}<span v-if="song.collaborator_1">,{{song.collaborator_1}}</span><span v-if="song.collaborator_2">,{{song.collaborator_2}}</span><span v-if="song.collaborator_3">,{{song.collaborator_3}}</span><span v-if="song.collaborator_4">,{{song.collaborator_4}}</span><p></p></td>
			<td>
			<audio ref="audioElements" @click="playSong(index, song.song_id);" @play="increase_plays($event, song.song_id, index)" @pause="set_flag($event, song.song_id)" @ended="playNext(index, song.song_id)" preload="auto" controls="controls" autobuffer>
			  <source :src="'../static/audio/' + song.song_id + '.mp3'" type="audio/mpeg">
			  Your browser does not support the audio element.
			</audio>
			</td>
			<td v-if="song.rating">{{song.rating}}</td>
			<td v-else>-</td>
			<td><p>{{song.album_name}}</p></td>
			<td>
			<router-link :to="'/song/' + song.song_id + '/lyrics'"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-music-note-list" viewBox="0 0 16 16"><path d="M12 13c0 1.105-1.12 2-2.5 2S7 14.105 7 13s1.12-2 2.5-2 2.5.895 2.5 2"/><path fill-rule="evenodd" d="M12 3v10h-1V3z"/><path d="M11 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 16 2.22V4l-5 1z"/><path fill-rule="evenodd" d="M0 11.5a.5.5 0 0 1 .5-.5H4a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5m0-4A.5.5 0 0 1 .5 7H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5m0-4A.5.5 0 0 1 .5 3H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5"/></svg></router-link>
			</td>
			<td>
			<button role="button" @click="show_options($event, index)" type="button" class="btn dropdown" to="#" data-bs-toggle="dropdown" id="dropdownMenu2" aria-haspopup="true" aria-expanded="false"> 
			    <span><svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" fill="currentColor" class="bi bi-three-dots" viewBox="0 0 16 16"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/></svg></span>
			</button>
			<div :id="'option' + index" class="dropdown-menu pull-left" aria-labelledby="dropdownMenu2" style="background-color: #202020; left: 85%;">
		    	<router-link class="dropdown-item" :to="'/user/playlist/' + song.playlist_id" style="text-align: left">Go to Album</router-link>
		  		<button class="dropdown-item" style="font-size: 15px; text-align: left; text-transform: none;" role="button" @click="go_to_artist($event, index)" type="button" class="btn dropdown" to="#" data-bs-toggle="dropdown" id="dropdownMenu2" aria-haspopup="true" aria-expanded="false">
		  			Go to Artist&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▷
		  		</button>
		  		<div :id="'drop' + index" class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenu2" style="background-color: #202020; left: -82%; top: 36px;">
		        	<router-link class="dropdown-item" :to="'/user/creator_profile/'+song.creator_id">{{song.creator_name}}</router-link>
		        	<router-link v-if="song.collaborator_1" class="dropdown-item" :to="'/user/creator_profile/'+song.collaborator_1_id">{{song.collaborator_1}}</router-link>
		        	<router-link v-if="song.collaborator_2" class="dropdown-item" :to="'/user/creator_profile/'+song.collaborator_2_id">{{song.collaborator_2}}</router-link>
		        	<router-link v-if="song.collaborator_3" class="dropdown-item" :to="'/user/creator_profile/'+song.collaborator_3_id">{{song.collaborator_3}}</router-link>
		        	<router-link v-if="song.collaborator_4" class="dropdown-item" :to="'/user/creator_profile/'+song.collaborator_4_id">{{song.collaborator_4}}</router-link>
	        	</div>
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
		    	<button v-if="flag" @click="delete_song($event, song.song_id)" class="dropdown-item">Delete Song</button>
		    </div>
			</td>
		</tr>
		</template>
		<h3 v-if="(songs.filter(song => song.flag === null).length == 0 && flagged==false) || (songs.length == 0)">Add songs to your playlist now!</h3>
	</table>

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
	        <form :action="'/creator/song/'+ song_id +'/delete'" method="POST" @submit.prevent="confirm_deletion">
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
     		playlist_id: this.$route.params.playlist_id,
     		songs: [],
     		header: null,
     		option: null,
     		drop: null,
     		playlist: null,
     		playlists: [],
     		new_playlist: false,
     		song_id: null,
     		pause: {},
     		flag: null,
     		action: null,
     		flagged: null,
     		shuffle: false,
     		played: [],
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

		show_playlist_options(event, index) {
			const element = document.getElementById("playlist_options");
			if (this.option) {
				element.classList.remove("show");
				this.option = false;
			} else {
				element.classList.add("show");
				this.option = true;
			}
		},

		go_to_artist(event, index) {
			const element = document.getElementById("drop" + index);
			if (this.drop) {
				element.classList.remove("show");
				this.drop = false;
			} else {
				element.classList.add("show");
				this.drop = true;
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

		close_toast(event) {
			this.auth = false;
     		this.delete_message = false;
     		this.message = false;
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
	    	var nextIndex = null
	    	if (this.shuffle) {
	    		if (this.played.length <= this.songs.length) {
		        	nextIndex = Math.floor(Math.random() * this.songs.length);
		        	if (this.played.length < this.songs.length) {
			        	while (this.played.includes(nextIndex)){
			        		nextIndex = Math.floor(Math.random() * this.songs.length);
				        }
				    } else {
						nextIndex = this.songs.length + 1;
					}
				}
	    	} else {
				nextIndex = index + 1;
	        }

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

	  	create_playlist(event, song_id, playlist_id){
	  		this.song_id = song_id;
	    	this.new_playlist = true;
	    	const modal = document.getElementById('playlistModal');

	    	if (playlist_id !== null){
	    		this.action = "Edit";
	    	}
	        // Show the modal
	        if (modal) {
	            modal.classList.add('show');
	            modal.style.display = 'block';
	            document.body.classList.add('modal-open');
	            modal.setAttribute('aria-modal', 'true');
	  		}
		},

		async submit_playlist(event){
	  		if (this.action == 'Edit') {
		  			const queryParams = new URLSearchParams({
				    playlist_id: this.playlist_id,
				    playlist_name: document.querySelector('#playlistModal input[type="text"]').value,
				    user_id: this.user_id,
				    token: this.token,
				});

		  		console.log(playlist_name)
				const res = await fetch(`/api/user/playlist?${queryParams}`, {
		        method: 'PUT',
		    });

			    const result = await res.json();
				if (result.status_code === 200) {
					localStorage.setItem("message", "Playlist updated successfully!");
					location.reload();
			  	} else {
			  		localStorage.setItem("message", result.message);
			  		location.reload();
			  	}
			} else {
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

		increase_plays(event, song_id, index) {
			if (this.pause[song_id] == true) {
				this.pause[song_id] = false
			} else {
				this.played.push(index);
				const queryParams = new URLSearchParams({
				    song_id: song_id,
				    playlist_id: this.playlist_id,
				    user_id: this.user_id,
				    token: this.token
				});

				this.playlist = null;

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

		delete_playlist(event) {
			const modal = document.getElementById('deleteModal');
	        if (modal) {
	            modal.classList.add('show');
	            modal.style.display = 'block';
	            document.body.classList.add('modal-open');
	            modal.setAttribute('aria-modal', 'true');
		  	}
		},

		async confirm_deletion() {
			const queryParams = new URLSearchParams({
			    playlist_id: this.playlist_id,
			    token: this.token,
			});

			const res = await fetch(`/api/user/playlist?${queryParams}`, {
		        method: 'DELETE',
		    });

		    const result = await res.json();
			if (result.status_code === 200) {
				localStorage.setItem("message", "Playlist deleted successfully!");
				router.push({
		    		name: 'user_home'
	    		});
		  	} else {
		  		localStorage.setItem("message", result.message);
		  		location.reload();
		  	}	
		},

		async delete_song(event, song_id){
			const queryParams = new URLSearchParams({
			    playlist_id: this.playlist_id,
			    song_id: song_id,
			    token: this.token,
			});

			const res = await fetch(`/api/user/playlist?${queryParams}`, {
		        method: 'DELETE',
		    });

		    const result = await res.json();
			if (result.status_code === 200) {
				localStorage.setItem("message", "Song deleted successfully!");
				location.reload();
		  	} else {
		  		localStorage.setItem("message", result.message);
		  		location.reload();
		  	}
		},

		async change_flag() {
			const queryParams = new URLSearchParams({
			    user_id: this.user_id,
			    flag: this.flagged,
			    token: this.token,
			});

			const res = await fetch(`/api/user/flag?${queryParams}`, {
		        method: 'POST',
		    });
			location.reload()
		},
	},

	async created() {
		const response = await fetch(`/api/redis/get/${this.user_id}`);
	    const data = await response.json();
	    if (data.data) {
	    	this.token = data.data.token;
	    	this.role = data.data.role;
	    }

    	if (this.token && (this.role == 'User' || this.role == 'Creator')) {
    		const queryParams = new URLSearchParams({
			    playlist_id: this.playlist_id,
			    user_id: this.user_id,
			    token: this.token,
			});

			const res = await fetch(`/api/user/playlist?${queryParams}`, {
		        method: 'GET',
		    });
		    const result = await res.json();
			if (result.status_code === 200 && result.message === 'Retrieval Successful') {
				this.songs = result.songs;
				this.header = result.header;
				this.playlists = result.playlists;
				this.flagged = result.flagged;
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

  		document.title = this.header;
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

export default playlists