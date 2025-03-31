
import { Route, Switch } from "wouter";
import RealTimeOffersPage from "./pages/real-time-offers";

export default function App() {
  return (
    <Switch>
      <Route path="/real-time-offers" component={RealTimeOffersPage} />
      {/* Otras rutas existentes */}
    </Switch>
  );
}
