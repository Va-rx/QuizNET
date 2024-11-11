import { Component } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-share-health',
  templateUrl: './share-health.component.html',
  styleUrls: ['./share-health.component.css']
})
export class ShareHealthComponent {

  constructor(private dialogRef: MatDialogRef<ShareHealthComponent>) {}
  shareHealth(value: boolean): void {
    this.dialogRef.close(value);
  }

}
