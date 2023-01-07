import { NgModule } from '@angular/core';
import { TruncatePipe } from 'app/pipes/truncate.pipe';

@NgModule({
  declarations: [TruncatePipe],
  exports:[TruncatePipe]
})
export class PipesModule { 
}