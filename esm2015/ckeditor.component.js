/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */
var CKEditorComponent_1;
import * as tslib_1 from "tslib";
import { Component, NgZone, Input, Output, EventEmitter, forwardRef, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { getEditorNamespace } from './ckeditor.helpers';
let CKEditorComponent = CKEditorComponent_1 = class CKEditorComponent {
    constructor(elementRef, ngZone) {
        this.elementRef = elementRef;
        this.ngZone = ngZone;
        /**
         * Tag name of the editor component.
         *
         * The default tag is `textarea`.
         */
        this.tagName = 'textarea';
        /**
         * The type of the editor interface.
         *
         * By default editor interface will be initialized as `divarea` editor which is an inline editor with fixed UI.
         * You can change interface type by choosing between `divarea` and `inline` editor interface types.
         *
         * See https://ckeditor.com/docs/ckeditor4/latest/guide/dev_uitypes.html
         * and https://ckeditor.com/docs/ckeditor4/latest/examples/fixedui.html
         * to learn more.
         */
        this.type = "classic" /* CLASSIC */;
        this.UI = "classic" /* CLASSIC */;
        /**
         * Fires when the editor is ready. It corresponds with the `editor#instanceReady`
         * https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_editor.html#event-instanceReady
         * event.
         */
        this.ready = new EventEmitter();
        this.created = new EventEmitter();
        /**
         * Fires when the editor data is loaded, e.g. after calling setData()
         * https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_editor.html#method-setData
         * editor's method. It corresponds with the `editor#dataReady`
         * https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_editor.html#event-dataReady event.
         */
        this.dataReady = new EventEmitter();
        /**
         * Fires when the content of the editor has changed. It corresponds with the `editor#change`
         * https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_editor.html#event-change
         * event. For performance reasons this event may be called even when data didn't really changed.
         * Please note that this event will only be fired when `undo` plugin is loaded. If you need to
         * listen for editor changes (e.g. for two-way data binding), use `dataChange` event instead.
         */
        this.change = new EventEmitter();
        /**
         * Fires when the content of the editor has changed. In contrast to `change` - only emits when
         * data really changed thus can be successfully used with `[data]` and two way `[(data)]` binding.
         *
         * See more: https://angular.io/guide/template-syntax#two-way-binding---
         */
        this.dataChange = new EventEmitter();
        /**
         * Fires when the editing view of the editor is focused. It corresponds with the `editor#focus`
         * https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_editor.html#event-focus
         * event.
         */
        this.focus = new EventEmitter();
        /**
         * Fires when the editing view of the editor is blurred. It corresponds with the `editor#blur`
         * https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_editor.html#event-blur
         * event.
         */
        this.blur = new EventEmitter();
        /**
         * If the component is read–only before the editor instance is created, it remembers that state,
         * so the editor can become read–only once it is ready.
         */
        this._readOnly = null;
        this._data = null;
        /**
         * CKEditor 4 script url address. Script will be loaded only if CKEDITOR namespace is missing.
         *
         * Defaults to 'https://cdn.ckeditor.com/4.14.0/standard-all/ckeditor.js'
         */
        this.editorUrl = 'https://cdn.ckeditor.com/4.14.0/standard-all/ckeditor.js';
    }
    /**
     * Keeps track of the editor's data.
     *
     * It's also decorated as an input which is useful when not using the ngModel.
     *
     * See https://angular.io/api/forms/NgModel to learn more.
     */
    set data(data) {
        if (data === this._data) {
            return;
        }
        if (this.instance) {
            this.instance.setData(data);
            // Data may be changed by ACF.
            this._data = this.instance.getData();
            return;
        }
        this._data = data;
    }
    get data() {
        return this._data;
    }
    /**
     * When set `true`, the editor becomes read-only.
     * https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_editor.html#property-readOnly
     * to learn more.
     */
    set readOnly(isReadOnly) {
        if (this.instance) {
            this.instance.setReadOnly(isReadOnly);
            return;
        }
        // Delay setting read-only state until editor initialization.
        this._readOnly = isReadOnly;
    }
    get readOnly() {
        if (this.instance) {
            return this.instance.readOnly;
        }
        return this._readOnly;
    }
    ngAfterViewInit() {
        getEditorNamespace(this.editorUrl).then(() => {
            this.ngZone.runOutsideAngular(this.createEditor.bind(this));
        }).catch(window.console.error);
    }
    ngOnDestroy() {
        this.ngZone.runOutsideAngular(() => {
            if (this.instance) {
                this.instance.destroy();
                this.instance = null;
            }
        });
    }
    writeValue(value) {
        this.data = value;
    }
    registerOnChange(callback) {
        this.onChange = callback;
    }
    registerOnTouched(callback) {
        this.onTouched = callback;
    }
    createEditor() {
        const element = document.createElement(this.tagName);
        this.elementRef.nativeElement.appendChild(element);
        if (this.type === "divarea" /* DIVAREA */) {
            this.config = this.ensureDivareaPlugin(this.config || {});
        }
        CKEDITOR.on('instanceCreated', evt => {
            this.ngZone.run(() => {
                this.created.emit(evt);
            });
        });
        const instance = this.type === "inline" /* INLINE */
            ? CKEDITOR.inline(element, this.config)
            : CKEDITOR.replace(element, this.config);
        instance.UI = this.UI;
        instance.once('instanceReady', evt => {
            this.instance = instance;
            // Read only state may change during instance initialization.
            this.readOnly = this._readOnly !== null ? this._readOnly : this.instance.readOnly;
            this.subscribe(this.instance);
            const undo = instance.undoManager;
            if (this.data !== null) {
                undo && undo.lock();
                instance.setData(this.data, { callback: () => {
                        // Locking undoManager prevents 'change' event.
                        // Trigger it manually to updated bound data.
                        if (this.data !== instance.getData()) {
                            undo ? instance.fire('change') : instance.fire('dataReady');
                        }
                        undo && undo.unlock();
                        this.ngZone.run(() => {
                            this.ready.emit(evt);
                        });
                    } });
            }
            else {
                this.ngZone.run(() => {
                    this.ready.emit(evt);
                });
            }
        });
    }
    subscribe(editor) {
        editor.on('focus', evt => {
            this.ngZone.run(() => {
                this.focus.emit(evt);
            });
        });
        editor.on('blur', evt => {
            this.ngZone.run(() => {
                if (this.onTouched) {
                    this.onTouched();
                }
                this.blur.emit(evt);
            });
        });
        editor.on('dataReady', this.propagateChange, this);
        if (this.instance.undoManager) {
            editor.on('change', this.propagateChange, this);
        }
        // If 'undo' plugin is not loaded, listen to 'selectionCheck' event instead. (#54).
        else {
            editor.on('selectionCheck', this.propagateChange, this);
        }
    }
    propagateChange(event) {
        this.ngZone.run(() => {
            const newData = this.instance.getData();
            if (event.name == 'change') {
                this.change.emit(event);
            }
            else if (event.name == 'dataReady') {
                this.dataReady.emit(event);
            }
            if (newData === this.data) {
                return;
            }
            this._data = newData;
            this.dataChange.emit(newData);
            if (this.onChange) {
                this.onChange(newData);
            }
        });
    }
    ensureDivareaPlugin(config) {
        let { extraPlugins, removePlugins } = config;
        extraPlugins = this.removePlugin(extraPlugins, 'divarea') || '';
        extraPlugins = extraPlugins.concat(typeof extraPlugins === 'string' ? ',divarea' : 'divarea');
        if (removePlugins && removePlugins.includes('divarea')) {
            removePlugins = this.removePlugin(removePlugins, 'divarea');
            console.warn('[CKEDITOR] divarea plugin is required to initialize editor using Angular integration.');
        }
        return Object.assign({}, config, { extraPlugins, removePlugins });
    }
    removePlugin(plugins, toRemove) {
        if (!plugins) {
            return null;
        }
        const isString = typeof plugins === 'string';
        if (isString) {
            plugins = plugins.split(',');
        }
        plugins = plugins.filter(plugin => plugin !== toRemove);
        if (isString) {
            plugins = plugins.join(',');
        }
        return plugins;
    }
};
CKEditorComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: NgZone }
];
tslib_1.__decorate([
    Input()
], CKEditorComponent.prototype, "config", void 0);
tslib_1.__decorate([
    Input()
], CKEditorComponent.prototype, "tagName", void 0);
tslib_1.__decorate([
    Input()
], CKEditorComponent.prototype, "type", void 0);
tslib_1.__decorate([
    Input()
], CKEditorComponent.prototype, "UI", void 0);
tslib_1.__decorate([
    Input()
], CKEditorComponent.prototype, "data", null);
tslib_1.__decorate([
    Input()
], CKEditorComponent.prototype, "readOnly", null);
tslib_1.__decorate([
    Output()
], CKEditorComponent.prototype, "ready", void 0);
tslib_1.__decorate([
    Output()
], CKEditorComponent.prototype, "created", void 0);
tslib_1.__decorate([
    Output()
], CKEditorComponent.prototype, "dataReady", void 0);
tslib_1.__decorate([
    Output()
], CKEditorComponent.prototype, "change", void 0);
tslib_1.__decorate([
    Output()
], CKEditorComponent.prototype, "dataChange", void 0);
tslib_1.__decorate([
    Output()
], CKEditorComponent.prototype, "focus", void 0);
tslib_1.__decorate([
    Output()
], CKEditorComponent.prototype, "blur", void 0);
tslib_1.__decorate([
    Input()
], CKEditorComponent.prototype, "editorUrl", void 0);
CKEditorComponent = CKEditorComponent_1 = tslib_1.__decorate([
    Component({
        selector: 'ckeditor',
        template: '<ng-template></ng-template>',
        providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => CKEditorComponent_1),
                multi: true,
            }
        ]
    })
], CKEditorComponent);
export { CKEditorComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2tlZGl0b3IuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vY2tlZGl0b3I0LWFuZ3VsYXIvIiwic291cmNlcyI6WyJja2VkaXRvci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHOzs7QUFFSCxPQUFPLEVBQ04sU0FBUyxFQUNULE1BQU0sRUFDTixLQUFLLEVBQ0wsTUFBTSxFQUNOLFlBQVksRUFDWixVQUFVLEVBQ1YsVUFBVSxFQUNWLGFBQWEsRUFBRSxTQUFTLEVBQ3hCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFFTixpQkFBaUIsRUFDakIsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQWtCeEQsSUFBYSxpQkFBaUIseUJBQTlCLE1BQWEsaUJBQWlCO0lBb0s3QixZQUFxQixVQUFzQixFQUFVLE1BQWM7UUFBOUMsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUFVLFdBQU0sR0FBTixNQUFNLENBQVE7UUE1Sm5FOzs7O1dBSUc7UUFDTSxZQUFPLEdBQUcsVUFBVSxDQUFDO1FBRTlCOzs7Ozs7Ozs7V0FTRztRQUNNLFNBQUksMkJBQXNEO1FBRTFELE9BQUUsMkJBQXNEO1FBb0RqRTs7OztXQUlHO1FBQ08sVUFBSyxHQUFHLElBQUksWUFBWSxFQUF1QixDQUFDO1FBR2hELFlBQU8sR0FBRyxJQUFJLFlBQVksRUFBdUIsQ0FBQztRQUU1RDs7Ozs7V0FLRztRQUNPLGNBQVMsR0FBRyxJQUFJLFlBQVksRUFBdUIsQ0FBQztRQUU5RDs7Ozs7O1dBTUc7UUFDTyxXQUFNLEdBQUcsSUFBSSxZQUFZLEVBQXVCLENBQUM7UUFFM0Q7Ozs7O1dBS0c7UUFDTyxlQUFVLEdBQUcsSUFBSSxZQUFZLEVBQXVCLENBQUM7UUFFL0Q7Ozs7V0FJRztRQUNPLFVBQUssR0FBRyxJQUFJLFlBQVksRUFBdUIsQ0FBQztRQUUxRDs7OztXQUlHO1FBQ08sU0FBSSxHQUFH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O1NBQzlDO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDaEIsQ0FBQztDQUNELENBQUE7O1lBektpQyxVQUFVO1lBQWtCLE1BQU07O0FBOUoxRDtJQUFSLEtBQUssRUFBRTtpREFBMkI7QUFPMUI7SUFBUixLQUFLLEVBQUU7a0RBQXNCO0FBWXJCO0lBQVIsS0FBSyxFQUFFOytDQUEyRDtBQUUxRDtJQUFSLEtBQUssRUFBRTs2Q0FBeUQ7QUFTeEQ7SUFBUixLQUFLLEVBQUU7NkNBY1A7QUFXUTtJQUFSLEtBQUssRUFBRTtpREFRUDtBQWVTO0lBQVQsTUFBTSxFQUFFO2dEQUFpRDtBQUdoRDtJQUFULE1BQU0sRUFBRTtrREFBbUQ7QUFRbEQ7SUFBVCxNQUFNLEVBQUU7b0RBQXFEO0FBU3BEO0lBQVQsTUFBTSxFQUFFO2lEQUFrRDtBQVFqRDtJQUFULE1BQU0sRUFBRTtxREFBc0Q7QUFPckQ7SUFBVCxNQUFNLEVBQUU7Z0RBQWlEO0FBT2hEO0lBQVQsTUFBTSxFQUFFOytDQUFnRDtBQW9DaEQ7SUFBUixLQUFLLEVBQUU7b0RBQXdFO0FBbEtwRSxpQkFBaUI7SUFaN0IsU0FBUyxDQUFFO1FBQ1gsUUFBUSxFQUFFLFVBQVU7UUFDcEIsUUFBUSxFQUFFLDZCQUE2QjtRQUV2QyxTQUFTLEVBQUU7WUFDVjtnQkFDQyxPQUFPLEVBQUUsaUJBQWlCO2dCQUMxQixXQUFXLEVBQUUsVUFBVSxDQUFFLEdBQUcsRUFBRSxDQUFDLG1CQUFpQixDQUFFO2dCQUNsRCxLQUFLLEVBQUUsSUFBSTthQUNYO1NBQ0Q7S0FDRCxDQUFFO0dBQ1UsaUJBQWlCLENBNlU3QjtTQTdVWSxpQkFBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlIENvcHlyaWdodCAoYykgMjAwMy0yMDIwLCBDS1NvdXJjZSAtIEZyZWRlcmljbyBLbmFiYmVuLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogRm9yIGxpY2Vuc2luZywgc2VlIExJQ0VOU0UubWQuXG4gKi9cblxuaW1wb3J0IHtcblx0Q29tcG9uZW50LFxuXHROZ1pvbmUsXG5cdElucHV0LFxuXHRPdXRwdXQsXG5cdEV2ZW50RW1pdHRlcixcblx0Zm9yd2FyZFJlZixcblx0RWxlbWVudFJlZixcblx0QWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95XG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1xuXHRDb250cm9sVmFsdWVBY2Nlc3Nvcixcblx0TkdfVkFMVUVfQUNDRVNTT1Jcbn0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuXG5pbXBvcnQgeyBnZXRFZGl0b3JOYW1lc3BhY2UgfSBmcm9tICcuL2NrZWRpdG9yLmhlbHBlcnMnO1xuXG5pbXBvcnQgeyBDS0VkaXRvcjQgfSBmcm9tICcuL2NrZWRpdG9yJztcblxuZGVjbGFyZSBsZXQgQ0tFRElUT1I6IGFueTtcblxuQENvbXBvbmVudCgge1xuXHRzZWxlY3RvcjogJ2NrZWRpdG9yJyxcblx0dGVtcGxhdGU6ICc8bmctdGVtcGxhdGU+PC9uZy10ZW1wbGF0ZT4nLFxuXG5cdHByb3ZpZGVyczogW1xuXHRcdHtcblx0XHRcdHByb3ZpZGU6IE5HX1ZBTFVFX0FDQ0VTU09SLFxuXHRcdFx0dXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoICgpID0+IENLRWRpdG9yQ29tcG9uZW50ICksXG5cdFx0XHRtdWx0aTogdHJ1ZSxcblx0XHR9XG5cdF1cbn0gKVxuZXhwb3J0IGNsYXNzIENLRWRpdG9yQ29tcG9uZW50IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95LCBDb250cm9sVmFsdWVBY2Nlc3NvciB7XG5cdC8qKlxuXHQgKiBUaGUgY29uZmlndXJhdGlvbiBvZiB0aGUgZWRpdG9yLlxuXHQgKiBTZWUgaHR0cHM6Ly9ja2VkaXRvci5jb20vZG9jcy9ja2VkaXRvcjQvbGF0ZXN0L2FwaS9DS0VESVRPUl9jb25maWcuaHRtbFxuXHQgKiB0byBsZWFybiBtb3JlLlxuXHQgKi9cblx0QElucHV0KCkgY29uZmlnPzogQ0tFZGl0b3I0LkNvbmZpZztcblxuXHQvKipcblx0ICogVGFnIG5hbWUgb2YgdGhlIGVkaXRvciBjb21wb25lbnQuXG5cdCAqXG5cdCAqIFRoZSBkZWZhdWx0IHRhZyBpcyBgdGV4dGFyZWFgLlxuXHQgKi9cblx0QElucHV0KCkgdGFnTmFtZSA9ICd0ZXh0YXJlYSc7XG5cblx0LyoqXG5cdCAqIFRoZSB0eXBlIG9mIHRoZSBlZGl0b3IgaW50ZXJmYWNlLlxuXHQgKlxuXHQgKiBCeSBkZWZhdWx0IGVkaXRvciBpbnRlcmZhY2Ugd2lsbCBiZSBpbml0aWFsaXplZCBhcyBgZGl2YXJlYWAgZWRpdG9yIHdoaWNoIGlzIGFuIGlubGluZSBlZGl0b3Igd2l0aCBmaXhlZCBVSS5cblx0ICogWW91IGNhbiBjaGFuZ2UgaW50ZXJmYWNlIHR5cGUgYnkgY2hvb3NpbmcgYmV0d2VlbiBgZGl2YXJlYWAgYW5kIGBpbmxpbmVgIGVkaXRvciBpbnRlcmZhY2UgdHlwZXMuXG5cdCAqXG5cdCAqIFNlZSBodHRwczovL2NrZWRpdG9yLmNvbS9kb2NzL2NrZWRpdG9yNC9sYXRlc3QvZ3VpZGUvZGV2X3VpdHlwZXMuaHRtbFxuXHQgKiBhbmQgaHR0cHM6Ly9ja2VkaXRvci5jb20vZG9jcy9ja2VkaXRvcjQvbGF0ZXN0L2V4YW1wbGVzL2ZpeGVkdWkuaHRtbFxuXHQgKiB0byBsZWFybiBtb3JlLlxuXHQgKi9cblx0QElucHV0KCkgdHlwZTogQ0tFZGl0b3I0LkVkaXRvclR5cGUgPSBDS0VkaXRvcjQuRWRpdG9yVHlwZS5DTEFTU0lDO1xuXG5cdEBJbnB1dCgpIFVJOiBDS0VkaXRvcjQuRWRpdG9yVHlwZSA9IENLRWRpdG9yNC5FZGl0b3JUeXBlLkNMQVNTSUM7XG5cblx0LyoqXG5cdCAqIEtlZXBzIHRyYWNrIG9mIHRoZSBlZGl0b3IncyBkYXRhLlxuXHQgKlxuXHQgKiBJdCdzIGFsc28gZGVjb3JhdGVkIGFzIGFuIGlucHV0IHdoaWNoIGlzIHVzZWZ1bCB3aGVuIG5vdCB1c2luZyB0aGUgbmdNb2RlbC5cblx0ICpcblx0ICogU2VlIGh0dHBzOi8vYW5ndWxhci5pby9hcGkvZm9ybXMvTmdNb2RlbCB0byBsZWFybiBtb3JlLlxuXHQgKi9cblx0QElucHV0KCkgc2V0IGRhdGEoIGRhdGE6IHN0cmluZyApIHtcblx0XHRpZiAoIGRhdGEgPT09IHRoaXMuX2RhdGEgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLmluc3RhbmNlICkge1xuXHRcdFx0dGhpcy5pbnN0YW5jZS5zZXREYXRhKCBkYXRhICk7XG5cdFx0XHQvLyBEYXRhIG1heSBiZSBjaGFuZ2VkIGJ5IEFDRi5cblx0XHRcdHRoaXMuX2RhdGEgPSB0aGlzLmluc3RhbmNlLmdldERhdGEoKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLl9kYXRhID0gZGF0YTtcblxuXHR9XG5cblx0Z2V0IGRhdGEoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5fZGF0YTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaGVuIHNldCBgdHJ1ZWAsIHRoZSBlZGl0b3IgYmVjb21lcyByZWFkLW9ubHkuXG5cdCAqIGh0dHBzOi8vY2tlZGl0b3IuY29tL2RvY3MvY2tlZGl0b3I0L2xhdGVzdC9hcGkvQ0tFRElUT1JfZWRpdG9yLmh0bWwjcHJvcGVydHktcmVhZE9ubHlcblx0ICogdG8gbGVhcm4gbW9yZS5cblx0ICovXG5cdEBJbnB1dCgpIHNldCByZWFkT25seSggaXNSZWFkT25seTogYm9vbGVhbiApIHtcblx0XHRpZiAoIHRoaXMuaW5zdGFuY2UgKSB7XG5cdFx0XHR0aGlzLmluc3RhbmNlLnNldFJlYWRPbmx5KCBpc1JlYWRPbmx5ICk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gRGVsYXkgc2V0dGluZyByZWFkLW9ubHkgc3RhdGUgdW50aWwgZWRpdG9yIGluaXRpYWxpemF0aW9uLlxuXHRcdHRoaXMuX3JlYWRPbmx5ID0gaXNSZWFkT25seTtcblx0fVxuXG5cdGdldCByZWFkT25seSgpOiBib29sZWFuIHtcblx0XHRpZiAoIHRoaXMuaW5zdGFuY2UgKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5pbnN0YW5jZS5yZWFkT25seTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5fcmVhZE9ubHk7XG5cdH1cblxuXHQvKipcblx0ICogRmlyZXMgd2hlbiB0aGUgZWRpdG9yIGlzIHJlYWR5LiBJdCBjb3JyZXNwb25kcyB3aXRoIHRoZSBgZWRpdG9yI2luc3RhbmNlUmVhZHlgXG5cdCAqIGh0dHBzOi8vY2tlZGl0b3IuY29tL2RvY3MvY2tlZGl0b3I0L2xhdGVzdC9hcGkvQ0tFRElUT1JfZWRpdG9yLmh0bWwjZXZlbnQtaW5zdGFuY2VSZWFkeVxuXHQgKiBldmVudC5cblx0ICovXG5cdEBPdXRwdXQoKSByZWFkeSA9IG5ldyBFdmVudEVtaXR0ZXI8Q0tFZGl0b3I0LkV2ZW50SW5mbz4oKTtcblxuXHRcblx0QE91dHB1dCgpIGNyZWF0ZWQgPSBuZXcgRXZlbnRFbWl0dGVyPENLRWRpdG9yNC5FdmVudEluZm8+KCk7XG5cblx0LyoqXG5cdCAqIEZpcmVzIHdoZW4gdGhlIGVkaXRvciBkYXRhIGlzIGxvYWRlZCwgZS5nLiBhZnRlciBjYWxsaW5nIHNldERhdGEoKVxuXHQgKiBodHRwczovL2NrZWRpdG9yLmNvbS9kb2NzL2NrZWRpdG9yNC9sYXRlc3QvYXBpL0NLRURJVE9SX2VkaXRvci5odG1sI21ldGhvZC1zZXREYXRhXG5cdCAqIGVkaXRvcidzIG1ldGhvZC4gSXQgY29ycmVzcG9uZHMgd2l0aCB0aGUgYGVkaXRvciNkYXRhUmVhZHlgXG5cdCAqIGh0dHBzOi8vY2tlZGl0b3IuY29tL2RvY3MvY2tlZGl0b3I0L2xhdGVzdC9hcGkvQ0tFRElUT1JfZWRpdG9yLmh0bWwjZXZlbnQtZGF0YVJlYWR5IGV2ZW50LlxuXHQgKi9cblx0QE91dHB1dCgpIGRhdGFSZWFkeSA9IG5ldyBFdmVudEVtaXR0ZXI8Q0tFZGl0b3I0LkV2ZW50SW5mbz4oKTtcblxuXHQvKipcblx0ICogRmlyZXMgd2hlbiB0aGUgY29udGVudCBvZiB0aGUgZWRpdG9yIGhhcyBjaGFuZ2VkLiBJdCBjb3JyZXNwb25kcyB3aXRoIHRoZSBgZWRpdG9yI2NoYW5nZWBcblx0ICogaHR0cHM6Ly9ja2VkaXRvci5jb20vZG9jcy9ja2VkaXRvcjQvbGF0ZXN0L2FwaS9DS0VESVRPUl9lZGl0b3IuaHRtbCNldmVudC1jaGFuZ2Vcblx0ICogZXZlbnQuIEZvciBwZXJmb3JtYW5jZSByZWFzb25zIHRoaXMgZXZlbnQgbWF5IGJlIGNhbGxlZCBldmVuIHdoZW4gZGF0YSBkaWRuJ3QgcmVhbGx5IGNoYW5nZWQuXG5cdCAqIFBsZWFzZSBub3RlIHRoYXQgdGhpcyBldmVudCB3aWxsIG9ubHkgYmUgZmlyZWQgd2hlbiBgdW5kb2AgcGx1Z2luIGlzIGxvYWRlZC4gSWYgeW91IG5lZWQgdG9cblx0ICogbGlzdGVuIGZvciBlZGl0b3IgY2hhbmdlcyAoZS5nLiBmb3IgdHdvLXdheSBkYXRhIGJpbmRpbmcpLCB1c2UgYGRhdGFDaGFuZ2VgIGV2ZW50IGluc3RlYWQuXG5cdCAqL1xuXHRAT3V0cHV0KCkgY2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxDS0VkaXRvcjQuRXZlbnRJbmZvPigpO1xuXG5cdC8qKlxuXHQgKiBGaXJlcyB3aGVuIHRoZSBjb250ZW50IG9mIHRoZSBlZGl0b3IgaGFzIGNoYW5nZWQuIEluIGNvbnRyYXN0IHRvIGBjaGFuZ2VgIC0gb25seSBlbWl0cyB3aGVuXG5cdCAqIGRhdGEgcmVhbGx5IGNoYW5nZWQgdGh1cyBjYW4gYmUgc3VjY2Vzc2Z1bGx5IHVzZWQgd2l0aCBgW2RhdGFdYCBhbmQgdHdvIHdheSBgWyhkYXRhKV1gIGJpbmRpbmcuXG5cdCAqXG5cdCAqIFNlZSBtb3JlOiBodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvdGVtcGxhdGUtc3ludGF4I3R3by13YXktYmluZGluZy0tLVxuXHQgKi9cblx0QE91dHB1dCgpIGRhdGFDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPENLRWRpdG9yNC5FdmVudEluZm8+KCk7XG5cblx0LyoqXG5cdCAqIEZpcmVzIHdoZW4gdGhlIGVkaXRpbmcgdmlldyBvZiB0aGUgZWRpdG9yIGlzIGZvY3VzZWQuIEl0IGNvcnJlc3BvbmRzIHdpdGggdGhlIGBlZGl0b3IjZm9jdXNgXG5cdCAqIGh0dHBzOi8vY2tlZGl0b3IuY29tL2RvY3MvY2tlZGl0b3I0L2xhdGVzdC9hcGkvQ0tFRElUT1JfZWRpdG9yLmh0bWwjZXZlbnQtZm9jdXNcblx0ICogZXZlbnQuXG5cdCAqL1xuXHRAT3V0cHV0KCkgZm9jdXMgPSBuZXcgRXZlbnRFbWl0dGVyPENLRWRpdG9yNC5FdmVudEluZm8+KCk7XG5cblx0LyoqXG5cdCAqIEZpcmVzIHdoZW4gdGhlIGVkaXRpbmcgdmlldyBvZiB0aGUgZWRpdG9yIGlzIGJsdXJyZWQuIEl0IGNvcnJlc3BvbmRzIHdpdGggdGhlIGBlZGl0b3IjYmx1cmBcblx0ICogaHR0cHM6Ly9ja2VkaXRvci5jb20vZG9jcy9ja2VkaXRvcjQvbGF0ZXN0L2FwaS9DS0VESVRPUl9lZGl0b3IuaHRtbCNldmVudC1ibHVyXG5cdCAqIGV2ZW50LlxuXHQgKi9cblx0QE91dHB1dCgpIGJsdXIgPSBuZXcgRXZlbnRFbWl0dGVyPENLRWRpdG9yNC5FdmVudEluZm8+KCk7XG5cblx0LyoqXG5cdCAqIFRoZSBpbnN0YW5jZSBvZiB0aGUgZWRpdG9yIGNyZWF0ZWQgYnkgdGhpcyBjb21wb25lbnQuXG5cdCAqL1xuXHRpbnN0YW5jZTogYW55O1xuXG5cdC8qKlxuXHQgKiBJZiB0aGUgY29tcG9uZW50IGlzIHJlYWTigJNvbmx5IGJlZm9yZSB0aGUgZWRpdG9yIGluc3RhbmNlIGlzIGNyZWF0ZWQsIGl0IHJlbWVtYmVycyB0aGF0IHN0YXRlLFxuXHQgKiBzbyB0aGUgZWRpdG9yIGNhbiBiZWNvbWUgcmVhZOKAk29ubHkgb25jZSBpdCBpcyByZWFkeS5cblx0ICovXG5cdHByaXZhdGUgX3JlYWRPbmx5OiBib29sZWFuID0gbnVsbDtcblxuXHQvKipcblx0ICogQSBjYWxsYmFjayBleGVjdXRlZCB3aGVuIHRoZSBjb250ZW50IG9mIHRoZSBlZGl0b3IgY2hhbmdlcy4gUGFydCBvZiB0aGVcblx0ICogYENvbnRyb2xWYWx1ZUFjY2Vzc29yYCAoaHR0cHM6Ly9hbmd1bGFyLmlvL2FwaS9mb3Jtcy9Db250cm9sVmFsdWVBY2Nlc3NvcikgaW50ZXJmYWNlLlxuXHQgKlxuXHQgKiBOb3RlOiBVbnNldCB1bmxlc3MgdGhlIGNvbXBvbmVudCB1c2VzIHRoZSBgbmdNb2RlbGAuXG5cdCAqL1xuXHRvbkNoYW5nZT86ICggZGF0YTogc3RyaW5nICkgPT4gdm9pZDtcblxuXHQvKipcblx0ICogQSBjYWxsYmFjayBleGVjdXRlZCB3aGVuIHRoZSBlZGl0b3IgaGFzIGJlZW4gYmx1cnJlZC4gUGFydCBvZiB0aGVcblx0ICogYENvbnRyb2xWYWx1ZUFjY2Vzc29yYCAoaHR0cHM6Ly9hbmd1bGFyLmlvL2FwaS9mb3Jtcy9Db250cm9sVmFsdWVBY2Nlc3NvcikgaW50ZXJmYWNlLlxuXHQgKlxuXHQgKiBOb3RlOiBVbnNldCB1bmxlc3MgdGhlIGNvbXBvbmVudCB1c2VzIHRoZSBgbmdNb2RlbGAuXG5cdCAqL1xuXHRvblRvdWNoZWQ/OiAoKSA9PiB2b2lkO1xuXG5cdHByaXZhdGUgX2RhdGE6IHN0cmluZyA9IG51bGw7XG5cblx0LyoqXG5cdCAqIENLRWRpdG9yIDQgc2NyaXB0IHVybCBhZGRyZXNzLiBTY3JpcHQgd2lsbCBiZSBsb2FkZWQgb25seSBpZiBDS0VESVRPUiBuYW1lc3BhY2UgaXMgbWlzc2luZy5cblx0ICpcblx0ICogRGVmYXVsdHMgdG8gJ2h0dHBzOi8vY2RuLmNrZWRpdG9yLmNvbS80LjE0LjAvc3RhbmRhcmQtYWxsL2NrZWRpdG9yLmpzJ1xuXHQgKi9cblx0QElucHV0KCkgZWRpdG9yVXJsID0gJ2h0dHBzOi8vY2RuLmNrZWRpdG9yLmNvbS80LjE0LjAvc3RhbmRhcmQtYWxsL2NrZWRpdG9yLmpzJztcblxuXHRjb25zdHJ1Y3RvciggcHJpdmF0ZSBlbGVtZW50UmVmOiBFbGVtZW50UmVmLCBwcml2YXRlIG5nWm9uZTogTmdab25lICkge1xuXHR9XG5cblx0bmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuXHRcdGdldEVkaXRvck5hbWVzcGFjZSggdGhpcy5lZGl0b3JVcmwgKS50aGVuKCAoKSA9PiB7XG5cdFx0XHR0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhciggdGhpcy5jcmVhdGVFZGl0b3IuYmluZCggdGhpcyApICk7XG5cdFx0fSApLmNhdGNoKCB3aW5kb3cuY29uc29sZS5lcnJvciApO1xuXHR9XG5cblx0bmdPbkRlc3Ryb3koKTogdm9pZCB7XG5cdFx0dGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoICgpID0+IHtcblx0XHRcdGlmICggdGhpcy5pbnN0YW5jZSApIHtcblx0XHRcdFx0dGhpcy5pbnN0YW5jZS5kZXN0cm95KCk7XG5cdFx0XHRcdHRoaXMuaW5zdGFuY2UgPSBudWxsO1xuXHRcdFx0fVxuXHRcdH0gKTtcblx0fVxuXG5cdHdyaXRlVmFsdWUoIHZhbHVlOiBzdHJpbmcgKTogdm9pZCB7XG5cdFx0dGhpcy5kYXRhID0gdmFsdWU7XG5cdH1cblxuXHRyZWdpc3Rlck9uQ2hhbmdlKCBjYWxsYmFjazogKCBkYXRhOiBzdHJpbmcgKSA9PiB2b2lkICk6IHZvaWQge1xuXHRcdHRoaXMub25DaGFuZ2UgPSBjYWxsYmFjaztcblx0fVxuXG5cdHJlZ2lzdGVyT25Ub3VjaGVkKCBjYWxsYmFjazogKCkgPT4gdm9pZCApOiB2b2lkIHtcblx0XHR0aGlzLm9uVG91Y2hlZCA9IGNhbGxiYWNrO1xuXHR9XG5cblx0cHJpdmF0ZSBjcmVhdGVFZGl0b3IoKTogdm9pZCB7XG5cdFx0Y29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoIHRoaXMudGFnTmFtZSApO1xuXHRcdHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmFwcGVuZENoaWxkKCBlbGVtZW50ICk7XG5cblx0XHRpZiAoIHRoaXMudHlwZSA9PT0gQ0tFZGl0b3I0LkVkaXRvclR5cGUuRElWQVJFQSApIHtcblx0XHRcdHRoaXMuY29uZmlnID0gdGhpcy5lbnN1cmVEaXZhcmVhUGx1Z2luKCB0aGlzLmNvbmZpZyB8fCB7fSApO1xuXHRcdH1cblxuXHRcdENLRURJVE9SLm9uKCdpbnN0YW5jZUNyZWF0ZWQnLCBldnQgPT4ge1xuXHRcdFx0dGhpcy5uZ1pvbmUucnVuKCAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuY3JlYXRlZC5lbWl0KCBldnQgKTtcblx0XHRcdH0gKTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IGluc3RhbmNlOiBDS0VkaXRvcjQuRWRpdG9yID0gdGhpcy50eXBlID09PSBDS0VkaXRvcjQuRWRpdG9yVHlwZS5JTkxJTkVcblx0XHRcdD8gQ0tFRElUT1IuaW5saW5lKCBlbGVtZW50LCB0aGlzLmNvbmZpZyApXG5cdFx0XHQ6IENLRURJVE9SLnJlcGxhY2UoIGVsZW1lbnQsIHRoaXMuY29uZmlnICk7XG5cblx0XHRpbnN0YW5jZS5VSSA9IHRoaXMuVUk7XG5cblx0XHRpbnN0YW5jZS5vbmNlKCAnaW5zdGFuY2VSZWFkeScsIGV2dCA9PiB7XG5cdFx0XHR0aGlzLmluc3RhbmNlID0gaW5zdGFuY2U7XG5cblx0XHRcdC8vIFJlYWQgb25seSBzdGF0ZSBtYXkgY2hhbmdlIGR1cmluZyBpbnN0YW5jZSBpbml0aWFsaXphdGlvbi5cblx0XHRcdHRoaXMucmVhZE9ubHkgPSB0aGlzLl9yZWFkT25seSAhPT0gbnVsbCA/IHRoaXMuX3JlYWRPbmx5IDogdGhpcy5pbnN0YW5jZS5yZWFkT25seTtcblxuXHRcdFx0dGhpcy5zdWJzY3JpYmUoIHRoaXMuaW5zdGFuY2UgKTtcblxuXHRcdFx0Y29uc3QgdW5kbyA9IGluc3RhbmNlLnVuZG9NYW5hZ2VyO1xuXG5cdFx0XHRpZiAoIHRoaXMuZGF0YSAhPT0gbnVsbCApIHtcblx0XHRcdFx0dW5kbyAmJiB1bmRvLmxvY2soKTtcblxuXHRcdFx0XHRpbnN0YW5jZS5zZXREYXRhKCB0aGlzLmRhdGEsIHsgY2FsbGJhY2s6ICgpID0+IHtcblx0XHRcdFx0XHQvLyBMb2NraW5nIHVuZG9NYW5hZ2VyIHByZXZlbnRzICdjaGFuZ2UnIGV2ZW50LlxuXHRcdFx0XHRcdC8vIFRyaWdnZXIgaXQgbWFudWFsbHkgdG8gdXBkYXRlZCBib3VuZCBkYXRhLlxuXHRcdFx0XHRcdGlmICggdGhpcy5kYXRhICE9PSBpbnN0YW5jZS5nZXREYXRhKCkgKSB7XG5cdFx0XHRcdFx0XHR1bmRvID8gaW5zdGFuY2UuZmlyZSggJ2NoYW5nZScgKSA6IGluc3RhbmNlLmZpcmUoICdkYXRhUmVhZHknICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHVuZG8gJiYgdW5kby51bmxvY2soKTtcblxuXHRcdFx0XHRcdHRoaXMubmdab25lLnJ1biggKCkgPT4ge1xuXHRcdFx0XHRcdFx0dGhpcy5yZWFkeS5lbWl0KCBldnQgKTtcblx0XHRcdFx0XHR9ICk7XG5cdFx0XHRcdH0gfSApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5uZ1pvbmUucnVuKCAoKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5yZWFkeS5lbWl0KCBldnQgKTtcblx0XHRcdFx0fSApO1xuXHRcdFx0fVxuXHRcdH0gKTtcblx0fVxuXG5cdHByaXZhdGUgc3Vic2NyaWJlKCBlZGl0b3I6IGFueSApOiB2b2lkIHtcblx0XHRlZGl0b3Iub24oICdmb2N1cycsIGV2dCA9PiB7XG5cdFx0XHR0aGlzLm5nWm9uZS5ydW4oICgpID0+IHtcblx0XHRcdFx0dGhpcy5mb2N1cy5lbWl0KCBldnQgKTtcblx0XHRcdH0gKTtcblx0XHR9ICk7XG5cblx0XHRlZGl0b3Iub24oICdibHVyJywgZXZ0ID0+IHtcblx0XHRcdHRoaXMubmdab25lLnJ1biggKCkgPT4ge1xuXHRcdFx0XHRpZiAoIHRoaXMub25Ub3VjaGVkICkge1xuXHRcdFx0XHRcdHRoaXMub25Ub3VjaGVkKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGlzLmJsdXIuZW1pdCggZXZ0ICk7XG5cdFx0XHR9ICk7XG5cdFx0fSApO1xuXG5cdFx0ZWRpdG9yLm9uKCAnZGF0YVJlYWR5JywgdGhpcy5wcm9wYWdhdGVDaGFuZ2UsIHRoaXMgKTtcblxuXHRcdGlmICggdGhpcy5pbnN0YW5jZS51bmRvTWFuYWdlciApIHtcblx0XHRcdGVkaXRvci5vbiggJ2NoYW5nZScsIHRoaXMucHJvcGFnYXRlQ2hhbmdlLCB0aGlzICk7XG5cdFx0fVxuXHRcdC8vIElmICd1bmRvJyBwbHVnaW4gaXMgbm90IGxvYWRlZCwgbGlzdGVuIHRvICdzZWxlY3Rpb25DaGVjaycgZXZlbnQgaW5zdGVhZC4gKCM1NCkuXG5cdFx0ZWxzZSB7XG5cdFx0XHRlZGl0b3Iub24oICdzZWxlY3Rpb25DaGVjaycsIHRoaXMucHJvcGFnYXRlQ2hhbmdlLCB0aGlzICk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBwcm9wYWdhdGVDaGFuZ2UoIGV2ZW50OiBhbnkgKTogdm9pZCB7XG5cdFx0dGhpcy5uZ1pvbmUucnVuKCAoKSA9PiB7XG5cdFx0XHRjb25zdCBuZXdEYXRhID0gdGhpcy5pbnN0YW5jZS5nZXREYXRhKCk7XG5cblx0XHRcdGlmICggZXZlbnQubmFtZSA9PSAnY2hhbmdlJyApIHtcblx0XHRcdFx0dGhpcy5jaGFuZ2UuZW1pdCggZXZlbnQgKTtcblx0XHRcdH0gZWxzZSBpZiAoIGV2ZW50Lm5hbWUgPT0gJ2RhdGFSZWFkeScgKSB7XG5cdFx0XHRcdHRoaXMuZGF0YVJlYWR5LmVtaXQoIGV2ZW50ICk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggbmV3RGF0YSA9PT0gdGhpcy5kYXRhICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuX2RhdGEgPSBuZXdEYXRhO1xuXHRcdFx0dGhpcy5kYXRhQ2hhbmdlLmVtaXQoIG5ld0RhdGEgKTtcblxuXHRcdFx0aWYgKCB0aGlzLm9uQ2hhbmdlICkge1xuXHRcdFx0XHR0aGlzLm9uQ2hhbmdlKCBuZXdEYXRhICk7XG5cdFx0XHR9XG5cdFx0fSApO1xuXHR9XG5cblx0cHJpdmF0ZSBlbnN1cmVEaXZhcmVhUGx1Z2luKCBjb25maWc6IENLRWRpdG9yNC5Db25maWcgKTogQ0tFZGl0b3I0LkNvbmZpZyB7XG5cdFx0bGV0IHsgZXh0cmFQbHVnaW5zLCByZW1vdmVQbHVnaW5zIH0gPSBjb25maWc7XG5cblx0XHRleHRyYVBsdWdpbnMgPSB0aGlzLnJlbW92ZVBsdWdpbiggZXh0cmFQbHVnaW5zLCAnZGl2YXJlYScgKSB8fCAnJztcblx0XHRleHRyYVBsdWdpbnMgPSBleHRyYVBsdWdpbnMuY29uY2F0KCB0eXBlb2YgZXh0cmFQbHVnaW5zID09PSAnc3RyaW5nJyA/ICcsZGl2YXJlYScgOiAnZGl2YXJlYScgKTtcblxuXHRcdGlmICggcmVtb3ZlUGx1Z2lucyAmJiByZW1vdmVQbHVnaW5zLmluY2x1ZGVzKCAnZGl2YXJlYScgKSApIHtcblxuXHRcdFx0cmVtb3ZlUGx1Z2lucyA9IHRoaXMucmVtb3ZlUGx1Z2luKCByZW1vdmVQbHVnaW5zLCAnZGl2YXJlYScgKTtcblxuXHRcdFx0Y29uc29sZS53YXJuKCAnW0NLRURJVE9SXSBkaXZhcmVhIHBsdWdpbiBpcyByZXF1aXJlZCB0byBpbml0aWFsaXplIGVkaXRvciB1c2luZyBBbmd1bGFyIGludGVncmF0aW9uLicgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gT2JqZWN0LmFzc2lnbigge30sIGNvbmZpZywgeyBleHRyYVBsdWdpbnMsIHJlbW92ZVBsdWdpbnMgfSApO1xuXHR9XG5cblx0cHJpdmF0ZSByZW1vdmVQbHVnaW4oIHBsdWdpbnM6IHN0cmluZyB8IHN0cmluZ1tdLCB0b1JlbW92ZTogc3RyaW5nICk6IHN0cmluZyB8IHN0cmluZ1tdIHtcblx0XHRpZiAoICFwbHVnaW5zICkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0Y29uc3QgaXNTdHJpbmcgPSB0eXBlb2YgcGx1Z2lucyA9PT0gJ3N0cmluZyc7XG5cblx0XHRpZiAoIGlzU3RyaW5nICkge1xuXHRcdFx0cGx1Z2lucyA9ICggcGx1Z2lucyBhcyBzdHJpbmcgKS5zcGxpdCggJywnICk7XG5cdFx0fVxuXG5cdFx0cGx1Z2lucyA9ICggcGx1Z2lucyBhcyBzdHJpbmdbXSApLmZpbHRlciggcGx1Z2luID0+IHBsdWdpbiAhPT0gdG9SZW1vdmUgKTtcblxuXHRcdGlmICggaXNTdHJpbmcgKSB7XG5cdFx0XHRwbHVnaW5zID0gKCBwbHVnaW5zIGFzIHN0cmluZ1tdICkuam9pbiggJywnICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHBsdWdpbnM7XG5cdH1cbn1cbiJdfQ==