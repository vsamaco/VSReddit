// Singleton to represent links, votes, views
var vsreddit = new function() {
	this.username = "";
	this.links = [];
	this.links_index = {};
	this.subreddits = [];
	this.votes = {};
	this.recent_views = [];
	
	this.initLinks = function() {
		var raw_links = localStorage.getItem('links');
		var json_links = (raw_links ? JSON.parse(raw_links) : "");
		
		if( json_links != "" && json_links !== undefined ) {
			this.links = json_links;
			
			var temp_index = {};
			var temp_subreddits = [];
			
			$.each(json_links, function(i, link) {
				var link_id = link.data.id;
				temp_index[link_id] = i;
				
				var subreddit = link.data.subreddit;
				if(jQuery.inArray(subreddit, temp_subreddits) == -1)
					temp_subreddits.push(subreddit);
			});
			
			this.links_index = temp_index;
			
			temp_subreddits.sort(function(a, b) {
				var a = a.toLowerCase();
				var b = b.toLowerCase();
				return (a < b) ? -1 : (a > b) ? 1 : 0;
			});
			this.subreddits = temp_subreddits;
			console.log("initLinks links count:" + this.links.length);
			console.log("initLinks subreddits count:" + this.subreddits.length);
			console.log("initLinks subreddits value:" + JSON.stringify(this.subreddits));
			return true;
		}		
		else {
			return false;
		}
	};
	
	this.addLink = function(link) {
		this.links.unshift(link);
		localStorage.setItem('links', JSON.stringify(this.links));
	};
	
	this.removeLink = function(link) {
	
	};
	
	this.initVotes = function() {
		var raw_votes = localStorage.getItem('votes');
		var temp_votes = (raw_votes ? JSON.parse(raw_votes) : { "upvotes":[], "downvotes":[] });
		this.votes = temp_votes;
		
		localStorage.setItem('votes', JSON.stringify(this.votes));
		console.log("initVotes upvotes:" + this.votes.upvotes.length + " downvotes:" + this.votes.downvotes.length );
	};
	
	this.isUpVote = function(link_id) {
		if( jQuery.inArray(link_id, this.votes.upvotes) != -1 )
			return true;
		
		return false;
	};
	
	this.isDownVote = function(link_id) {
		if( jQuery.inArray(link_id, this.votes.downvotes) != -1 )
			return true;
		
		return false;
	};
	
	this.addVote = function(link_id, vote_type) {
		var voteList;
		if(vote_type == 1) {
			voteList = this.votes.upvotes;
		}
		else if(vote_type == -1) {
			voteList = this.votes.downvotes;
		}
		else
			return false;
		
		var index = jQuery.inArray(link_id, voteList);
		if( index == -1 ) { // add link id to front as latest
			voteList.unshift(link_id);
		}
		else { // link id already exists
			return false;
		}
		
		// update localstorage votes
		localStorage.setItem('votes', JSON.stringify(this.votes));
		return true;
	};
	
	this.removeVote = function(link_id, vote_type) {
		var voteList;
		if(vote_type == 1) {
			voteList = this.votes.upvotes;
		}
		else if(vote_type == -1) {
			voteList = this.votes.downvotes;
		}
		else
			return false;
		
		var index = jQuery.inArray(link_id, voteList);
		if( index != -1 ) { // remove only if id exists 
			voteList.splice(index, 1);
		}
		else { // link id doesn't exists
			return false;
		}	
		
		// update localstorage votes
		localStorage.setItem('votes', JSON.stringify(this.votes));
		return true;
	};
	
	this.initRecentViews = function() {
		var raw_recent_views = localStorage.getItem('recent_views');
		var temp_recent_views = (raw_recent_views ? JSON.parse(raw_recent_views) : []);
		this.recent_views = temp_recent_views;
		
		localStorage.setItem('recent_views', JSON.stringify(this.recent_views));
	};
	
	this.addRecentView = function(link_id) {
		var index = jQuery.inArray(link_id, this.recent_views);
		if( index != -1 ) { // found, remove from list first
			this.recent_views.splice(index,1);
		}
		this.recent_views.unshift(link_id);	
		
		if( this.recent_views.length > 5 )
			this.recent_views.pop();
			
		localStorage.setItem('recent_views', JSON.stringify(this.recent_views));
	};
	
	this.reloadLinks = function() {
		console.log("vsreddit resetLinks");
		
		localStorage.removeItem('links');
		localStorage.removeItem('votes');
		localStorage.removeItem('recent_views');
		
		//resetPage();
		
		var source = "http://www.reddit.com/.json?jsonp=loadData";//"data.js";
		$.ajax({
			url: source, 
			dataType: "jsonp", 
			crossDomain: true,
			success: function(data) {
				/*var links = JSON.stringify(data.data.children);
				localStorage.setItem('links', links);
				
				vsreddit.initLinks();
				vsreddit.initVotes();
				vsreddit.initRecentViews();
				initPage();
				
				$("#main div.messages").html("<p class='message'>Reload links and votes success</p>");
				console.log(data);
				console.log("reloadLinks json:" + source + " success");*/
			},
			error: function(data) {
				$("#main div.messages").html("<p class='message'>Reload links and votes failed</p>");
				console.log("resetLink json:" + source + " failed");
			}
		});	
	};	
}

function loadData(data)
{
	var links = JSON.stringify(data.data.children);
	localStorage.setItem('links', links);
	
	vsreddit.initLinks();
	vsreddit.initVotes();
	vsreddit.initRecentViews();
	initPage();
	
	$("#main div.messages").html("<p class='message'>Reload links and votes success</p>");
	console.log(data);
	console.log("reloadLinks json:" + source + " success");
}

$(document).ready(function(){
	// check if user logged in
	accountLogin();	
	
	// initialize links from localstorage or reddit api
	var result = vsreddit.initLinks();
	if( result == false ) {
		vsreddit.reloadLinks();
	}
	else {
		// initialize votes
		vsreddit.initVotes();
		
		// initialize recent views
		vsreddit.initRecentViews();
		
		// populate subreddits to category list
		initPage();
	}
	
});

function initPage() {
	// populate subreddits to category list
	$("#category-list").append(outputCategories(vsreddit));
	
	// populate subreddits to category dropdown submit link form
	$("#submit-link-form select[name=subreddit]").append(outputCategoryLinkForm(vsreddit));
	
	// populate links to main content list
	$("#entry-list").append(outputLinks(vsreddit, "sort", "All"));
	
	var login = getAccount();
	if( login != null && login != "" ) {
		// populate upvotes to sidebar list
		$("#my-upvotes-list").html(outputUpVotes(vsreddit));
		
		// populate downvotes to sidebar list
		$("#my-downvotes-list").html(outputDownVotes(vsreddit));
		
		// populate recent views to sidebar list
		$("#recent-views-list").html(outputRecentViews(vsreddit));
	}
}

function resetPage() {
	$("#category-list").html('<li class=\"option\">All</li>\n<li class=\"option\">reddit.com</option>\n');
	$("#submit-link-form select").html('<option value=\"reddit.com\">reddit.com</option>\n');
	$("#entry-list").html('');
}

function submitLogin(form) {
	$(form).parent().find(".alerts").empty();
	$(form).parent().find(".alerts").css("display","none");

	var success = true;
	var username = $("input[name=username]", form).val();
	console.log("login submit username:" + username);	
	
	if(username == "") {
		$(form).parent().find(".alerts").append("<li class='alert'>Username is required</div>");
		$("textarea[name=title]", form).focus();
		success = false;
		console.log("submitLink title empty");
	}
	
	if( success ) {
		localStorage.setItem('username', username);
		
		$('.login-btn').css('display','none');
		$('#nav-account .name').html(username);
		$('#nav-account').css('display', 'block');
		
		$("#entry-list").html(outputLinks(vsreddit, "sort", "All"));
		$("#my-upvotes-list").html(outputUpVotes(vsreddit));
		$("#my-downvotes-list").html(outputDownVotes(vsreddit));
		$("#recent-views-list").html(outputRecentViews(vsreddit));
		
		$.colorbox.close();
	}
	else {
		console.log("submitLogin failed");
		$(form).parent().find(".alerts").css("display","block");
	}
	$.colorbox.resize();
}

function getAccount() {
	var username = localStorage.getItem('username', username);
	if( username != null && username != "" )
		return username;
		
	//console.log("no username found");	
	return null;
}

function accountLogin() {
	var username = getAccount();
	console.log("accountLogin username:" + username);
	if( username != null) {
		$('.login-btn').css('display','none');
		$('#nav-account .name').html(username);
		$('#nav-account').css('display', 'block');
		console.log("already login");
		
		$("#entry-list").html(outputLinks(vsreddit, "sort", "All"));
	}
	else {
		console.log("not login");
	}
}

function accountLogout() {
	localStorage.removeItem('username');

	$('.login-btn').css('display','block');
	$('#nav-account').css('display', 'none');	
	$("#entry-list").html(outputLinks(vsreddit, "sort", "All"));
	
	// clear upvotes to sidebar list
	$("#my-upvotes-list").html("");
	
	// clear downvotes to sidebar list
	$("#my-downvotes-list").html("");
	
	// clear recent views to sidebar list
	$("#recent-views-list").html("");
	console.log("accountLogout");
}

function submitLink(form) {
	var success = true;
	$(form).parent().find(".alerts").empty();
	$(form).parent().find(".alerts").css("display","none");
	
	var title = $("textarea[name=title]", form).val();
	if( title == "" ) {
		$(form).parent().find(".alerts").append("<li class='alert'>Title is required</div>");
		$("textarea[name=title]", form).focus();
		error = false;
		console.log("submitLink title empty");
	}	
	
	var url = $("input[name=url]", form).val();
	if( url == "" ) {
		$(form).parent().find(".alerts").append("<li class='alert'>URL is required</div>");
		success = false;
		$("input[name=url]", form).focus();
		console.log("submitLink URL empty");
	}
	else {
		if( validateURL(url) == false ) {
			$(form).parent().find(".alerts").append("<li class='alert'>URL is invalid</div>");
			success = false;
			$("input[name=url]", form).focus();
			console.log("submitLink URL invalid");
		}
		else {
			console.log("submitLink URL valid");
		}
	}
	
	var subreddit = $(".subreddit option:selected", form).val();
	
	console.log("submitLink title:" + title);
	console.log("submitLink url:" + url);
	console.log("submitLink subreddit:" + subreddit);	
	
	if( success ) {
		console.log("submitLink success");	
		var link_object = createLinkObject(title, url, subreddit);
		console.log("linkobject:" + JSON.stringify(link_object));
		var link_html = outputLink(link_object);
		//console.log("html: " + link_html);
		vsreddit.addLink(link_object);
		vsreddit.addVote(link_object.data.id, 1);
		
		$("#category-title").html(subreddit);
		$("ul#entry-list").html(outputLinks(vsreddit, "sort", "All"));
		$("ul#entry-list").prepend(link_html);
		$.colorbox.close();
	}
	else {
		console.log("submitLink failed");
		$(form).parent().find(".alerts").css("display","block");
	}
	$.colorbox.resize();

}

function createLinkObject(title, url, subreddit) {
	console.log("createLinkObject title:" + title + " url:" + url + " subreddit:" + subreddit);
	var id = getUniqueID();
	var title = title
	var url = url
	var author = getAccount();
	var domain = url.match(/:\/\/(.[^/]+)/)[1];
	var thumbnail = '';
	var likes = 1;
	var dislikes = 0;
	var score = 0;
	var subreddit = subreddit;
	var permalink = "#permalink";
	var created = Math.round(new Date().getTime() / 1000);
	var num_comments = 0;
	
	var link_object = {
		"kind": "t3",
		"data": {
			"id" : id,
			"title" : title,
			"url" : url,
			"author" : author,
			"domain" : domain,
			"subreddit" : subreddit,
			"thumbnail" : thumbnail,
			"likes" : likes,
			"dislikes" : dislikes,
			"score" : score,
			"permalink" : permalink,
			"created" : created,
			"num_comments" : num_comments
		}
	};
	
	return link_object;
}

function voteLink(obj, link_id, vote) {
	console.log("voteLink link_id:" + link_id);
	console.log("voteLink vote:" + vote);
	
	if(getAccount() == null) {
		console.log("not logged in, open login block");
		$.colorbox({width:"400", inline:true, href:"#login-block"});
		return false;
	}	
	
	var voteList = '';
	var voteList_alt = '';
	var class_alt;
	
	if(vote == 1) {
		class_alt = "down";
	}
	else if(vote == -1) {
		class_alt = "up";
	}
	else
		return; 

	var score = parseInt($(obj).parent().find(".score").html());
		
	// add vote for given link
	if( $(obj).hasClass("selected") == false) {
		var result = vsreddit.addVote(link_id, vote);
		if( result == true) {
			$(obj).addClass("selected");
			score += vote;
			$(obj).parent().find(".score").html(score);
			console.log("voteLink:" + link_id + " success to add vote:" + vote + " score:" + score );
		}
		else {
			console.log("voteLink:" + link_id + " failed to add vote:" + vote);
		}
	}
	else { // remove vote for given link
		var result = vsreddit.removeVote(link_id, vote);
		if( result == true ) {
			$(obj).removeClass("selected");
			score += -vote;
			$(obj).parent().find(".score").html(score);
			console.log("voteLink:" + link_id + " success to remove vote:" + vote + " score:" + score  );
		}		
		else {
			console.log("voteLink:" + link_id + " failed to remove vote:" + vote );
		}
	}	
	
	// remove alternate vote for given link 
	if( $(obj).parent().find(".vote-"+class_alt).hasClass("selected") ) { 
		var result_alt = vsreddit.removeVote(link_id, -vote);
		if( result_alt ) {
			$(obj).parent().find(".vote-"+class_alt).removeClass("selected");			
			score += vote;
			$(obj).parent().find(".score").html(score);	
			console.log("voteLink:" + link_id + " success to remove alt vote:" + vote + " score:" + score );
		}
		else {
			console.log("voteLink:" + link_id + " failed to remove alt vote:" + -vote );
		}
	}
	
	// update upvotes to sidebar list
	$("#my-upvotes-list").html(outputUpVotes(vsreddit));
	
	// update downvotes to sidebar list
	$("#my-downvotes-list").html(outputDownVotes(vsreddit));
}

function outputLink(link, vote_type) {
	console.log("outputLink");
	var output = '';

	var id = link.data.id;
	var title = link.data.title;
	var url = link.data.url;
	var permalink = link.data.permalink;
	var author = link.data.author;
	var domain = link.data.domain;
	var subreddit = link.data.subreddit;
	var created = link.data.created;
	var timeago = timeAgo(created);
	if (!timeago)
		timeago += "just now";
	else
		timeago += " ago";
	var num_comments = link.data.num_comments;
	var thumbnail = link.data.thumbnail;
	
	var votes_up = link.data.ups;
	var votes_down = link.data.downs;
	var score = link.data.score;
	
	var login = getAccount();
	var up_voted = (vote_type == 1 && login ? 'selected' : '');
	var down_voted = (vote_type == -1 && login ? 'selected' : '');
	score += (up_voted ? 1 : down_voted ? -1 : 0);

	
	output += "<li class='entry id-" + id + " clearfix'>\n";
	output += "	<div class='votes'>\n";
	output += "		<div class='vote-up " + up_voted + "' onclick='voteLink(this,\"" + id + "\", 1);'></div>\n";
	output += "		<div class='score'>" + score + "</div>\n";
	output += "		<div class='vote-down " + down_voted + "' onclick='voteLink(this,\"" + id + "\", -1);'></div>\n";
	output += "	</div>\n";
	output += " <div class='body'>\n";
	if( thumbnail != "") {
		output += "	<div class='thumbnail'><img src='" + thumbnail + "'/></div>\n";
	}	
	output += "		<h3 class='title'><a href='" + url + "' target='_blank'>" + title + "</h3>\n";
	output += "		<div class='domain'><a href='#domain'>" + domain + "</a></div>\n";
	output += "		<div class='meta'>submitted <span class='timeago'>" + timeago + "</span> by <span class='author'>" + author + "</span> to <a href='#" + subreddit + "' class='subreddit'>" + subreddit + "</a></div>\n";
	output += " </div>\n";
	output += " <div class='status'>\n";
	output += " 	<div class='comments'><span class='label'>comments</span><span class='count'>" + num_comments + "</span></div>\n";
	output += " </div>\n";
	output += "</li>\n";
		
	return output;
}

function outputLinks(vsreddit_obj, sort, category) {
	console.log("outputLink sort:" + sort + " category:" + category);
	var output = '';
	var links = JSON.clone(vsreddit_obj.links);
		
	if(!category) 
		category = 'All';	
	else if(category != "All" && jQuery.inArray(category, vsreddit_obj.subreddits) == -1) {
		return "<li>No Results Found</li>";
	}
	
	sort = sort.toLowerCase();
	switch(sort) {
		case "top":
			links.sort(function(a, b) { // sort by score
				 var a = a.data.score;
				 var b = b.data.score;
				 return (a < b) ? 1 : (a > b) ? -1 : 0;
			});
			console.log("outputLink sort top");
			break;
		case "latest": // sort by created timestamp
			links.sort(function(a, b) {
				 var a = a.data.created;
				 var b = b.data.created;
				 return (a < b) ? 1 : (a > b) ? -1 : 0;
			});			
			console.log("outputLink latest top");
			break;
		default: // no sort, use array order
			break;
	}

	$.each(links, function(i, link) {
		link_id = link.data.id;
		link_subreddit = link.data.subreddit;

		if( link_subreddit == category || category == "All" ) {
			var vote_type = (vsreddit_obj.isUpVote(link_id) ? 1 : (vsreddit_obj.isDownVote(link_id) ? -1 : 0));
			output += outputLink(link, vote_type);					
		}
	});	
	
	return output;
}

function outputCategories(vsreddit_obj) {
	var output = '';
	var categories = vsreddit_obj.subreddits;
	
	$.each(categories, function(i, category) {
		output += "<li class='option' value='" + category + "'>" + category + "</li>\n";
	});
	return output;
}

function outputCategoryLinkForm(vsreddit_obj) {
	var output = '';
	var categories = vsreddit_obj.subreddits;
	
	$.each(categories, function(i, category) {
		var selected = "";
		if(category == "reddit.com")
			selected = "selected=TRUE";
		output += "<option value='" + category + "' " + selected + ">" + category + "</option>\n";
	});
	return output;
}

function outputRecentViews(vsreddit_obj) {
	var output = '';
	var links = vsreddit_obj.links;
	var recent_views = vsreddit_obj.recent_views;
	
	$.each(recent_views, function(i, link_id) {
		var link_index = vsreddit_obj.links_index[link_id];
		//console.log("link_index " + link_id + ":" + link_index);
		var link = links[link_index];
		var title = link.data.title;
		var url = link.data.url;
		var score = link.data.score;
		var num_comments = link.data.num_comments;
		
		output += "<li>\n";
		output += "	<p class='title'><a href='" + url + "' target='_blank'>" + title + "</a></p>";
		output += "	<p class='status'><span class='points'>" + score + "</span> points | <span class='comments'>" + num_comments + "</span> comments</p>\n";
		output += "</li>\n";
	});
	return output;
}

function outputUpVotes(vsreddit_obj) {
	var output = '';
	var links = vsreddit_obj.links;
	var upvotes = vsreddit_obj.votes.upvotes;

	$.each(upvotes, function(i, link_id) {
		var link_index = vsreddit_obj.links_index[link_id];
		var link = links[link_index];
		var title = link.data.title;
		var url = link.data.url;
		var score = link.data.score;
		var num_comments = link.data.num_comments;
		
		output += "<li>\n";
		output += "	<p class='title'><a href='" + url + "' target='_blank'>" + title + "</a></p>";
		output += "	<p class='status'><span class='points'>" + score + "</span> points | <span class='comments'>" + num_comments + "</span> comments</p>\n";
		output += "</li>\n";
	});
	return output;
}

function outputDownVotes(vsreddit_obj) {
	var output = '';
	var links = vsreddit_obj.links;
	var upvotes = vsreddit_obj.votes.downvotes;
	
	$.each(upvotes, function(i, link_id) {
		var link_index = vsreddit_obj.links_index[link_id];
		var link = links[link_index];
		var title = link.data.title;
		var url = link.data.url;
		var score = link.data.score;
		var num_comments = link.data.num_comments;
		
		output += "<li>\n";
		output += "	<p class='title'><a href='" + url + "' target='_blank'>" + title + "</a></p>";
		output += "	<p class='status'><span class='points'>" + score + "</span> points | <span class='comments'>" + num_comments + "</span> comments</p>\n";
		output += "</li>\n";
	});
	return output;	
}

function timeAgo(timestamp, granularity) {
	//console.log("timeago:" + timestamp);
	var output = '';
	var periods = [];

	if(!granularity) 
		granularity = 1;
	
	periods['months'] = 2419200;
	periods['week'] = 604800;
	periods['day'] = 86400;
	periods['hour'] = 3600;
	periods['minute'] = 60;
	periods['second'] = 1;
	
	var now = Math.round(new Date().getTime() / 1000);
	var difference = now - timestamp;
	
	//console.log("timeago now:" + now + " timestamp:" + timestamp + " difference:" + difference);
	for (var period in periods) {
		var seconds = periods[period];
		
		//console.log("timeago period:" + period + " seconds:" + seconds);
		if( difference >= seconds ) {
			//console.log( "timeago difference >= period" );
			time = Math.floor(difference / seconds);
			difference %= seconds;
			
			output += time + ' ';
			if( time > 1 ) {
				output += period + 's';
			}
			else {
				output += period + '';
			}
			
			granularity--;
			if(granularity==0)
				break;
			
		}
	}

	return output;
	
}

function validateURL(val) {
	if(/^([a-z]([a-z]|\d|\+|-|\.)*):(\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?((\[(|(v[\da-f]{1,}\.(([a-z]|\d|-|\.|_|~)|[!\$&'\(\)\*\+,;=]|:)+))\])|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=])*)(:\d*)?)(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*|(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)){0})(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(val)) {
		return true;
	} else {
		return false;
	}
}

function generateID() {
	var id = '';
	var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
	var length = 5;
	
	for (i = 0; i < length; i ++) {  
		charIndex = Math.floor(Math.random() * charset.length);  
		id += charset.charAt(charIndex);  
	}
	
	return id;
}

function getUniqueID() {
	var tempID = generateID();
	
	while(vsreddit[tempID] !== undefined)
		tempID = generateID();
	
	return tempID;
}

JSON.clone = function (obj) {
	return JSON.parse( JSON.stringify( obj ) );
};

