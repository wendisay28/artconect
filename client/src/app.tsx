import { Route, Switch } from "wouter";
import RealTimeOffersPage from "./pages/real-time-offers";

function CreateArtistProfile() {
  return (
    <div>
      <h1>Create Artist Profile</h1>
      <p>This is a placeholder for the artist profile creation page.</p>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/" component={() => <div>Home</div>} />
        <Route path="/real-time-offers" component={RealTimeOffersPage} />
        <Route path="/explore" component={() => <div>Explore</div>} />
        <Route path="/favorites" component={() => <div>Favorites</div>} />
        <Route path="/create-artist-profile" component={CreateArtistProfile} />
      </Switch>
    </div>
  );
}