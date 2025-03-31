
import { Route, Switch } from "wouter";
import RealTimeOffersPage from "./pages/real-time-offers";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/" component={() => <div>Home</div>} />
        <Route path="/real-time-offers" component={RealTimeOffersPage} />
        <Route path="/explore" component={() => <div>Explore</div>} />
        <Route path="/favorites" component={() => <div>Favorites</div>} />
      </Switch>
    </div>
  );
}
