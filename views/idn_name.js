<% var title = 'List - ' + id_name %>
<% include partials/header.ejs %>


<table>
		<tr>
			<% for(var coll in colls { %>
				<th><%= colls[coll] %></th>
				<td><%= colls[coll] %></td>
			<% } %>
		</tr>


<% include partials/footer.ejs %> 

/* 