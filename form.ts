import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output
} from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from "@angular/forms";
import { FieldConfig, Validator } from "../../field.interface";

@Component({
  exportAs: "dynamicForm",
  selector: "dynamic-form",
  template: `

  <form class="dynamic-form" [formGroup]="form" (submit)="onSubmit($event)">

  
   <div  *ngFor="let field of fields;">

  <ng-container *ngIf="field.inputType!=='group';else otherfields" dynamicField [field]="field" [group]="form"> 

  </ng-container>


  <ng-template #otherfields > 
  <ng-container  dynamicField [field]="field" [group]="form">
       
        </ng-container>
        <div   *ngFor="let field1 of field.field_Arr;">
       <ng-container  dynamicField [field]="field1" [group]="form">
       
        </ng-container>
         
        </div>
  </ng-template>
 

  </div>


  </form>
  `,
  styles: []
})
export class DynamicFormComponent implements OnInit {

  @Input() fields: FieldConfig[] = [];
  @Output() submit: EventEmitter<any> = new EventEmitter<any>();
  form: FormGroup;
  get value() {
    return this.form.value;
  }
  constructor(private fb: FormBuilder) { }
  ngOnInit() {
    this.form = this.createControl();
  }

  onSubmit(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.form.valid) {
      this.submit.emit(this.form.value);
    } else {
      this.validateAllFormFields(this.form);
    }
  }

  createControl() {
    // console.log(this.fields);

    const group = this.fb.group({});
    this.fields.forEach(field => {
      //  console.log(field.field_Arr);
      // field.field_Arr.forEach(field1 => {
      //   console.log(field1);
      // });
      if (field.type === 'group') {
        field.field_Arr.forEach(field1 => {
          if (field1.type === "button") return;
          const control = this.fb.control(
            field1.value,
            this.bindValidations(field1.validations || [])
          );
          group.addControl(field1.name, control);
        });
      }
      if (field.type === "button") return;
      const control = this.fb.control(
        field.value,
        this.bindValidations(field.validations || [])
      );
      group.addControl(field.name, control);
    });
    return group;
  }

  bindValidations(validations: any) {
    if (validations.length > 0) {
      const validList = [];
      validations.forEach(valid => {
        validList.push(valid.validator);
      });
      return Validators.compose(validList);
    }
    return null;
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control.markAsTouched({ onlySelf: true });
    });
  }
}
