<?php
// Simple password protection.
// If GRAPHIQL_KEY env var is set (e.g. via .htaccess), require ?key=... in the URL.
// Locally (no env var set), the playground is open.
$requiredKey = getenv('GRAPHIQL_KEY');

if ($requiredKey !== false && $requiredKey !== '') {
    if (!isset($_GET['key']) || !hash_equals($requiredKey, $_GET['key'])) {
        http_response_code(403);
        echo 'Access denied. Append ?key=YOUR_KEY to the URL.';
        exit;
    }
}
?>
<!DOCTYPE html>
<html>
<head>
  <title>GraphiQL</title>
  <link href="https://unpkg.com/graphiql@3.7.2/graphiql.min.css" rel="stylesheet" />
</head>
<body style="margin:0;height:100vh">
  <div id="graphiql" style="height:100vh"></div>
  <script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/graphiql@3.7.2/graphiql.min.js"></script>
  <script>
    const fetcher = GraphiQL.createFetcher({ url: './index.php' });
    ReactDOM.render(
      React.createElement(GraphiQL, { fetcher }),
      document.getElementById('graphiql')
    );
  </script>
</body>
</html>
# Test if the PHP file executes at all
curl -v "https://research.uni-leipzig.de/leipzig-momentum-panel/api/public/graphiql.php?key=your-secret-key"