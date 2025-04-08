

fetch(
    "https://api.igdb.com/v4/search",
    { method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Client-ID': 'Client ID',
        'Authorization': 'Bearer access_token',
      },
      body: "fields alternative_name,character,checksum,collection,company,description,game,name,platform,published_at,test_dummy,theme;"
  })
    .then(response => {
        console.log(response.json());
    })
    .catch(err => {
        console.error(err);
    });
  