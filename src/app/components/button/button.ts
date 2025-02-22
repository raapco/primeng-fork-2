import { CommonModule } from '@angular/common';
import { AfterContentInit, AfterViewInit, ChangeDetectionStrategy, Component, ContentChildren, Directive, ElementRef, EventEmitter, Input, NgModule, OnDestroy, Output, QueryList, TemplateRef, ViewEncapsulation } from '@angular/core';
import { PrimeTemplate } from 'primeng/api';
import { DomHandler } from 'primeng/dom';
import { RippleModule } from 'primeng/ripple';
import { ObjectUtils } from 'primeng/utils';

type ButtonIconPosition = 'left' | 'right' | 'top' | 'bottom';

@Directive({
    selector: '[pButton]',
    host: {
        class: 'p-element'
    }
})
export class ButtonDirective implements AfterViewInit, OnDestroy {
    @Input() iconPos: ButtonIconPosition = 'left';

    @Input() loadingIcon: string = 'pi pi-spinner pi-spin';

    @Input() get label(): string {
        return this._label;
    }

    set label(val: string) {
        this._label = val;

        if (this.initialized) {
            this.updateLabel();
            this.updateIcon();
            this.setStyleClass();
        }
    }

    @Input() get icon(): string {
        return this._icon;
    }

    set icon(val: string) {
        this._icon = val;

        if (this.initialized) {
            this.updateIcon();
            this.setStyleClass();
        }
    }

    @Input() get loading(): boolean {
        return this._loading;
    }

    set loading(val: boolean) {
        this._loading = val;

        if (this.initialized) {
            this.updateIcon();
            this.setStyleClass();
        }
    }

    public _label: string;

    public _icon: string;

    public _loading: boolean = false;

    public initialized: boolean;

    public _initialStyleClass: string;

    constructor(public el: ElementRef) {}

    ngAfterViewInit() {
        this._initialStyleClass = this.el.nativeElement.className;
        DomHandler.addMultipleClasses(this.el.nativeElement, this.getStyleClass());

        this.createIcon();
        this.createLabel();

        this.initialized = true;
    }

    getStyleClass(): string {
        let styleClass = 'p-button p-component';
        if (this.icon && !this.label && ObjectUtils.isEmpty(this.el.nativeElement.textContent)) {
            styleClass = styleClass + ' p-button-icon-only';
        }

        if (this.loading) {
            styleClass = styleClass + ' p-disabled p-button-loading';
            if (!this.icon && this.label) styleClass = styleClass + ' p-button-loading-label-only';
        }

        return styleClass;
    }

    setStyleClass() {
        let styleClass = this.getStyleClass();
        this._initialStyleClass = this.el.nativeElement.className;
        this.el.nativeElement.className = styleClass + ' ' + this._initialStyleClass;
    }

    createLabel() {
        if (this.label) {
            let labelElement = document.createElement('span');
            if (this.icon && !this.label) {
                labelElement.setAttribute('aria-hidden', 'true');
            }
            labelElement.className = 'p-button-label';
            labelElement.appendChild(document.createTextNode(this.label));

            this.el.nativeElement.appendChild(labelElement);
        }
    }

    createIcon() {
        if (this.icon || this.loading) {
            let iconElement = document.createElement('span');
            iconElement.className = 'p-button-icon';
            iconElement.setAttribute('aria-hidden', 'true');
            let iconPosClass = this.label ? 'p-button-icon-' + this.iconPos : null;

            if (iconPosClass) {
                DomHandler.addClass(iconElement, iconPosClass);
            }

            let iconClass = this.getIconClass();

            if (iconClass) {
                DomHandler.addMultipleClasses(iconElement, iconClass);
            }

            this.el.nativeElement.insertBefore(iconElement, this.el.nativeElement.firstChild);
        }
    }

    updateLabel() {
        let labelElement = DomHandler.findSingle(this.el.nativeElement, '.p-button-label');

        if (!this.label) {
            labelElement && this.el.nativeElement.removeChild(labelElement);
            return;
        }

        labelElement ? (labelElement.textContent = this.label) : this.createLabel();
    }

    updateIcon() {
        let iconElement = DomHandler.findSingle(this.el.nativeElement, '.p-button-icon');

        if (!this.icon && !this.loading) {
            iconElement && this.el.nativeElement.removeChild(iconElement);
            return;
        }

        if (iconElement) {
            if (this.iconPos) iconElement.className = 'p-button-icon p-button-icon-' + this.iconPos + ' ' + this.getIconClass();
            else iconElement.className = 'p-button-icon ' + this.getIconClass();
        } else {
            this.createIcon();
        }
    }

    getIconClass() {
        return this.loading ? 'p-button-loading-icon ' + this.loadingIcon : this._icon;
    }

    ngOnDestroy() {
        this.initialized = false;
    }
}

@Component({
    selector: 'p-button',
    template: `
        <button
            [attr.type]="type"
            [attr.aria-label]="ariaLabel"
            [class]="styleClass"
            [ngStyle]="style"
            [disabled]="disabled || loading"
            [ngClass]="{
                'p-button p-component': true,
                'p-button-icon-only': icon && !label,
                'p-button-vertical': (iconPos === 'top' || iconPos === 'bottom') && label,
                'p-disabled': this.disabled || this.loading,
                'p-button-loading': this.loading,
                'p-button-loading-label-only': this.loading && !this.icon && this.label
            }"
            (click)="onClick.emit($event)"
            (focus)="onFocus.emit($event)"
            (blur)="onBlur.emit($event)"
            pRipple
        >
            <ng-content></ng-content>
            <ng-container *ngTemplateOutlet="contentTemplate"></ng-container>
            <span
                [ngClass]="{
                    'p-button-icon': true,
                    'p-button-icon-left': iconPos === 'left' && label,
                    'p-button-icon-right': iconPos === 'right' && label,
                    'p-button-icon-top': iconPos === 'top' && label,
                    'p-button-icon-bottom': iconPos === 'bottom' && label
                }"
                [class]="loading ? 'p-button-loading-icon ' + loadingIcon : icon"
                *ngIf="!contentTemplate && (icon || loading)"
                [attr.aria-hidden]="true"
            ></span>
            <span class="p-button-label" [attr.aria-hidden]="icon && !label" *ngIf="!contentTemplate && label">{{ label }}</span>
            <span [ngClass]="badgeStyleClass()" [class]="badgeClass" *ngIf="!contentTemplate && badge">{{ badge }}</span>
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'p-element'
    }
})
export class Button implements AfterContentInit {
    @Input() type: string = 'button';

    @Input() iconPos: ButtonIconPosition = 'left';

    @Input() icon: string;

    @Input() badge: string;

    @Input() label: string;

    @Input() disabled: boolean;

    @Input() loading: boolean = false;

    @Input() loadingIcon: string = 'pi pi-spinner pi-spin';

    @Input() style: any;

    @Input() styleClass: string;

    @Input() badgeClass: string;

    @Input() ariaLabel: string;

    contentTemplate: TemplateRef<any>;

    @ContentChildren(PrimeTemplate) templates: QueryList<any>;

    @Output() onClick: EventEmitter<any> = new EventEmitter();

    @Output() onFocus: EventEmitter<any> = new EventEmitter();

    @Output() onBlur: EventEmitter<any> = new EventEmitter();

    ngAfterContentInit() {
        this.templates.forEach((item) => {
            switch (item.getType()) {
                case 'content':
                    this.contentTemplate = item.template;
                    break;

                default:
                    this.contentTemplate = item.template;
                    break;
            }
        });
    }

    badgeStyleClass() {
        return {
            'p-badge p-component': true,
            'p-badge-no-gutter': this.badge && String(this.badge).length === 1
        };
    }
}

@NgModule({
    imports: [CommonModule, RippleModule],
    exports: [ButtonDirective, Button],
    declarations: [ButtonDirective, Button]
})
export class ButtonModule {}
