import { Component, signal } from "@angular/core";

@Component({
  selector: "demo-root",
  imports: [],
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App {
  protected readonly title = signal("demo");
}
