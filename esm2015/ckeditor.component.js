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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2tlZGl0b3IuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vY2tlZGl0b3I0LWFuZ3VsYXIvIiwic291cmNlcyI6WyJja2VkaXRvci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHOzs7QUFFSCxPQUFPLEVBQ04sU0FBUyxFQUNULE1BQU0sRUFDTixLQUFLLEVBQ0wsTUFBTSxFQUNOLFlBQVksRUFDWixVQUFVLEVBQ1YsVUFBVSxFQUNWLGFBQWEsRUFBRSxTQUFTLEVBQ3hCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFFTixpQkFBaUIsRUFDakIsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQWtCeEQsSUFBYSxpQkFBaUIseUJBQTlCLE1BQWEsaUJBQWlCO0lBa0s3QixZQUFxQixVQUFzQixFQUFVLE1BQWM7UUFBOUMsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUFVLFdBQU0sR0FBTixNQUFNLENBQVE7UUExSm5FOzs7O1dBSUc7UUFDTSxZQUFPLEdBQUcsVUFBVSxDQUFDO1FBRTlCOzs7Ozs7Ozs7V0FTRztRQUNNLFNBQUksMkJBQXNEO1FBb0RuRTs7OztXQUlHO1FBQ08sVUFBSyxHQUFHLElBQUksWUFBWSxFQUF1QixDQUFDO1FBR2hELFlBQU8sR0FBRyxJQUFJLFlBQVksRUFBdUIsQ0FBQztRQUU1RDs7Ozs7V0FLRztRQUNPLGNBQVMsR0FBRyxJQUFJLFlBQVksRUFBdUIsQ0FBQztRQUU5RDs7Ozs7O1dBTUc7UUFDTyxXQUFNLEdBQUcsSUFBSSxZQUFZLEVBQXVCLENBQUM7UUFFM0Q7Ozs7O1dBS0c7UUFDTyxlQUFVLEdBQUcsSUFBSSxZQUFZLEVBQXVCLENBQUM7UUFFL0Q7Ozs7V0FJRztRQUNPLFVBQUssR0FBRyxJQUFJLFlBQVksRUFBdUIsQ0FBQztRQUUxRDs7OztXQUlHO1FBQ08sU0FBSSxHQUFHLElBQUksWUFBWSxFQUF1QixD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a0IsTUFBTTs7QUE1SjFEO0lBQVIsS0FBSyxFQUFFO2lEQUEyQjtBQU8xQjtJQUFSLEtBQUssRUFBRTtrREFBc0I7QUFZckI7SUFBUixLQUFLLEVBQUU7K0NBQTJEO0FBUzFEO0lBQVIsS0FBSyxFQUFFOzZDQWNQO0FBV1E7SUFBUixLQUFLLEVBQUU7aURBUVA7QUFlUztJQUFULE1BQU0sRUFBRTtnREFBaUQ7QUFHaEQ7SUFBVCxNQUFNLEVBQUU7a0RBQW1EO0FBUWxEO0lBQVQsTUFBTSxFQUFFO29EQUFxRDtBQVNwRDtJQUFULE1BQU0sRUFBRTtpREFBa0Q7QUFRakQ7SUFBVCxNQUFNLEVBQUU7cURBQXNEO0FBT3JEO0lBQVQsTUFBTSxFQUFFO2dEQUFpRDtBQU9oRDtJQUFULE1BQU0sRUFBRTsrQ0FBZ0Q7QUFvQ2hEO0lBQVIsS0FBSyxFQUFFO29EQUF3RTtBQWhLcEUsaUJBQWlCO0lBWjdCLFNBQVMsQ0FBRTtRQUNYLFFBQVEsRUFBRSxVQUFVO1FBQ3BCLFFBQVEsRUFBRSw2QkFBNkI7UUFFdkMsU0FBUyxFQUFFO1lBQ1Y7Z0JBQ0MsT0FBTyxFQUFFLGlCQUFpQjtnQkFDMUIsV0FBVyxFQUFFLFVBQVUsQ0FBRSxHQUFHLEVBQUUsQ0FBQyxtQkFBaUIsQ0FBRTtnQkFDbEQsS0FBSyxFQUFFLElBQUk7YUFDWDtTQUNEO0tBQ0QsQ0FBRTtHQUNVLGlCQUFpQixDQTBVN0I7U0ExVVksaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZSBDb3B5cmlnaHQgKGMpIDIwMDMtMjAyMCwgQ0tTb3VyY2UgLSBGcmVkZXJpY28gS25hYmJlbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIEZvciBsaWNlbnNpbmcsIHNlZSBMSUNFTlNFLm1kLlxuICovXG5cbmltcG9ydCB7XG5cdENvbXBvbmVudCxcblx0Tmdab25lLFxuXHRJbnB1dCxcblx0T3V0cHV0LFxuXHRFdmVudEVtaXR0ZXIsXG5cdGZvcndhcmRSZWYsXG5cdEVsZW1lbnRSZWYsXG5cdEFmdGVyVmlld0luaXQsIE9uRGVzdHJveVxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtcblx0Q29udHJvbFZhbHVlQWNjZXNzb3IsXG5cdE5HX1ZBTFVFX0FDQ0VTU09SXG59IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcblxuaW1wb3J0IHsgZ2V0RWRpdG9yTmFtZXNwYWNlIH0gZnJvbSAnLi9ja2VkaXRvci5oZWxwZXJzJztcblxuaW1wb3J0IHsgQ0tFZGl0b3I0IH0gZnJvbSAnLi9ja2VkaXRvcic7XG5cbmRlY2xhcmUgbGV0IENLRURJVE9SOiBhbnk7XG5cbkBDb21wb25lbnQoIHtcblx0c2VsZWN0b3I6ICdja2VkaXRvcicsXG5cdHRlbXBsYXRlOiAnPG5nLXRlbXBsYXRlPjwvbmctdGVtcGxhdGU+JyxcblxuXHRwcm92aWRlcnM6IFtcblx0XHR7XG5cdFx0XHRwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcblx0XHRcdHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCAoKSA9PiBDS0VkaXRvckNvbXBvbmVudCApLFxuXHRcdFx0bXVsdGk6IHRydWUsXG5cdFx0fVxuXHRdXG59IClcbmV4cG9ydCBjbGFzcyBDS0VkaXRvckNvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSwgQ29udHJvbFZhbHVlQWNjZXNzb3Ige1xuXHQvKipcblx0ICogVGhlIGNvbmZpZ3VyYXRpb24gb2YgdGhlIGVkaXRvci5cblx0ICogU2VlIGh0dHBzOi8vY2tlZGl0b3IuY29tL2RvY3MvY2tlZGl0b3I0L2xhdGVzdC9hcGkvQ0tFRElUT1JfY29uZmlnLmh0bWxcblx0ICogdG8gbGVhcm4gbW9yZS5cblx0ICovXG5cdEBJbnB1dCgpIGNvbmZpZz86IENLRWRpdG9yNC5Db25maWc7XG5cblx0LyoqXG5cdCAqIFRhZyBuYW1lIG9mIHRoZSBlZGl0b3IgY29tcG9uZW50LlxuXHQgKlxuXHQgKiBUaGUgZGVmYXVsdCB0YWcgaXMgYHRleHRhcmVhYC5cblx0ICovXG5cdEBJbnB1dCgpIHRhZ05hbWUgPSAndGV4dGFyZWEnO1xuXG5cdC8qKlxuXHQgKiBUaGUgdHlwZSBvZiB0aGUgZWRpdG9yIGludGVyZmFjZS5cblx0ICpcblx0ICogQnkgZGVmYXVsdCBlZGl0b3IgaW50ZXJmYWNlIHdpbGwgYmUgaW5pdGlhbGl6ZWQgYXMgYGRpdmFyZWFgIGVkaXRvciB3aGljaCBpcyBhbiBpbmxpbmUgZWRpdG9yIHdpdGggZml4ZWQgVUkuXG5cdCAqIFlvdSBjYW4gY2hhbmdlIGludGVyZmFjZSB0eXBlIGJ5IGNob29zaW5nIGJldHdlZW4gYGRpdmFyZWFgIGFuZCBgaW5saW5lYCBlZGl0b3IgaW50ZXJmYWNlIHR5cGVzLlxuXHQgKlxuXHQgKiBTZWUgaHR0cHM6Ly9ja2VkaXRvci5jb20vZG9jcy9ja2VkaXRvcjQvbGF0ZXN0L2d1aWRlL2Rldl91aXR5cGVzLmh0bWxcblx0ICogYW5kIGh0dHBzOi8vY2tlZGl0b3IuY29tL2RvY3MvY2tlZGl0b3I0L2xhdGVzdC9leGFtcGxlcy9maXhlZHVpLmh0bWxcblx0ICogdG8gbGVhcm4gbW9yZS5cblx0ICovXG5cdEBJbnB1dCgpIHR5cGU6IENLRWRpdG9yNC5FZGl0b3JUeXBlID0gQ0tFZGl0b3I0LkVkaXRvclR5cGUuQ0xBU1NJQztcblxuXHQvKipcblx0ICogS2VlcHMgdHJhY2sgb2YgdGhlIGVkaXRvcidzIGRhdGEuXG5cdCAqXG5cdCAqIEl0J3MgYWxzbyBkZWNvcmF0ZWQgYXMgYW4gaW5wdXQgd2hpY2ggaXMgdXNlZnVsIHdoZW4gbm90IHVzaW5nIHRoZSBuZ01vZGVsLlxuXHQgKlxuXHQgKiBTZWUgaHR0cHM6Ly9hbmd1bGFyLmlvL2FwaS9mb3Jtcy9OZ01vZGVsIHRvIGxlYXJuIG1vcmUuXG5cdCAqL1xuXHRASW5wdXQoKSBzZXQgZGF0YSggZGF0YTogc3RyaW5nICkge1xuXHRcdGlmICggZGF0YSA9PT0gdGhpcy5fZGF0YSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMuaW5zdGFuY2UgKSB7XG5cdFx0XHR0aGlzLmluc3RhbmNlLnNldERhdGEoIGRhdGEgKTtcblx0XHRcdC8vIERhdGEgbWF5IGJlIGNoYW5nZWQgYnkgQUNGLlxuXHRcdFx0dGhpcy5fZGF0YSA9IHRoaXMuaW5zdGFuY2UuZ2V0RGF0YSgpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuX2RhdGEgPSBkYXRhO1xuXG5cdH1cblxuXHRnZXQgZGF0YSgpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLl9kYXRhO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdoZW4gc2V0IGB0cnVlYCwgdGhlIGVkaXRvciBiZWNvbWVzIHJlYWQtb25seS5cblx0ICogaHR0cHM6Ly9ja2VkaXRvci5jb20vZG9jcy9ja2VkaXRvcjQvbGF0ZXN0L2FwaS9DS0VESVRPUl9lZGl0b3IuaHRtbCNwcm9wZXJ0eS1yZWFkT25seVxuXHQgKiB0byBsZWFybiBtb3JlLlxuXHQgKi9cblx0QElucHV0KCkgc2V0IHJlYWRPbmx5KCBpc1JlYWRPbmx5OiBib29sZWFuICkge1xuXHRcdGlmICggdGhpcy5pbnN0YW5jZSApIHtcblx0XHRcdHRoaXMuaW5zdGFuY2Uuc2V0UmVhZE9ubHkoIGlzUmVhZE9ubHkgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBEZWxheSBzZXR0aW5nIHJlYWQtb25seSBzdGF0ZSB1bnRpbCBlZGl0b3IgaW5pdGlhbGl6YXRpb24uXG5cdFx0dGhpcy5fcmVhZE9ubHkgPSBpc1JlYWRPbmx5O1xuXHR9XG5cblx0Z2V0IHJlYWRPbmx5KCk6IGJvb2xlYW4ge1xuXHRcdGlmICggdGhpcy5pbnN0YW5jZSApIHtcblx0XHRcdHJldHVybiB0aGlzLmluc3RhbmNlLnJlYWRPbmx5O1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLl9yZWFkT25seTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGaXJlcyB3aGVuIHRoZSBlZGl0b3IgaXMgcmVhZHkuIEl0IGNvcnJlc3BvbmRzIHdpdGggdGhlIGBlZGl0b3IjaW5zdGFuY2VSZWFkeWBcblx0ICogaHR0cHM6Ly9ja2VkaXRvci5jb20vZG9jcy9ja2VkaXRvcjQvbGF0ZXN0L2FwaS9DS0VESVRPUl9lZGl0b3IuaHRtbCNldmVudC1pbnN0YW5jZVJlYWR5XG5cdCAqIGV2ZW50LlxuXHQgKi9cblx0QE91dHB1dCgpIHJlYWR5ID0gbmV3IEV2ZW50RW1pdHRlcjxDS0VkaXRvcjQuRXZlbnRJbmZvPigpO1xuXG5cdFxuXHRAT3V0cHV0KCkgY3JlYXRlZCA9IG5ldyBFdmVudEVtaXR0ZXI8Q0tFZGl0b3I0LkV2ZW50SW5mbz4oKTtcblxuXHQvKipcblx0ICogRmlyZXMgd2hlbiB0aGUgZWRpdG9yIGRhdGEgaXMgbG9hZGVkLCBlLmcuIGFmdGVyIGNhbGxpbmcgc2V0RGF0YSgpXG5cdCAqIGh0dHBzOi8vY2tlZGl0b3IuY29tL2RvY3MvY2tlZGl0b3I0L2xhdGVzdC9hcGkvQ0tFRElUT1JfZWRpdG9yLmh0bWwjbWV0aG9kLXNldERhdGFcblx0ICogZWRpdG9yJ3MgbWV0aG9kLiBJdCBjb3JyZXNwb25kcyB3aXRoIHRoZSBgZWRpdG9yI2RhdGFSZWFkeWBcblx0ICogaHR0cHM6Ly9ja2VkaXRvci5jb20vZG9jcy9ja2VkaXRvcjQvbGF0ZXN0L2FwaS9DS0VESVRPUl9lZGl0b3IuaHRtbCNldmVudC1kYXRhUmVhZHkgZXZlbnQuXG5cdCAqL1xuXHRAT3V0cHV0KCkgZGF0YVJlYWR5ID0gbmV3IEV2ZW50RW1pdHRlcjxDS0VkaXRvcjQuRXZlbnRJbmZvPigpO1xuXG5cdC8qKlxuXHQgKiBGaXJlcyB3aGVuIHRoZSBjb250ZW50IG9mIHRoZSBlZGl0b3IgaGFzIGNoYW5nZWQuIEl0IGNvcnJlc3BvbmRzIHdpdGggdGhlIGBlZGl0b3IjY2hhbmdlYFxuXHQgKiBodHRwczovL2NrZWRpdG9yLmNvbS9kb2NzL2NrZWRpdG9yNC9sYXRlc3QvYXBpL0NLRURJVE9SX2VkaXRvci5odG1sI2V2ZW50LWNoYW5nZVxuXHQgKiBldmVudC4gRm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMgdGhpcyBldmVudCBtYXkgYmUgY2FsbGVkIGV2ZW4gd2hlbiBkYXRhIGRpZG4ndCByZWFsbHkgY2hhbmdlZC5cblx0ICogUGxlYXNlIG5vdGUgdGhhdCB0aGlzIGV2ZW50IHdpbGwgb25seSBiZSBmaXJlZCB3aGVuIGB1bmRvYCBwbHVnaW4gaXMgbG9hZGVkLiBJZiB5b3UgbmVlZCB0b1xuXHQgKiBsaXN0ZW4gZm9yIGVkaXRvciBjaGFuZ2VzIChlLmcuIGZvciB0d28td2F5IGRhdGEgYmluZGluZyksIHVzZSBgZGF0YUNoYW5nZWAgZXZlbnQgaW5zdGVhZC5cblx0ICovXG5cdEBPdXRwdXQoKSBjaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPENLRWRpdG9yNC5FdmVudEluZm8+KCk7XG5cblx0LyoqXG5cdCAqIEZpcmVzIHdoZW4gdGhlIGNvbnRlbnQgb2YgdGhlIGVkaXRvciBoYXMgY2hhbmdlZC4gSW4gY29udHJhc3QgdG8gYGNoYW5nZWAgLSBvbmx5IGVtaXRzIHdoZW5cblx0ICogZGF0YSByZWFsbHkgY2hhbmdlZCB0aHVzIGNhbiBiZSBzdWNjZXNzZnVsbHkgdXNlZCB3aXRoIGBbZGF0YV1gIGFuZCB0d28gd2F5IGBbKGRhdGEpXWAgYmluZGluZy5cblx0ICpcblx0ICogU2VlIG1vcmU6IGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS90ZW1wbGF0ZS1zeW50YXgjdHdvLXdheS1iaW5kaW5nLS0tXG5cdCAqL1xuXHRAT3V0cHV0KCkgZGF0YUNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8Q0tFZGl0b3I0LkV2ZW50SW5mbz4oKTtcblxuXHQvKipcblx0ICogRmlyZXMgd2hlbiB0aGUgZWRpdGluZyB2aWV3IG9mIHRoZSBlZGl0b3IgaXMgZm9jdXNlZC4gSXQgY29ycmVzcG9uZHMgd2l0aCB0aGUgYGVkaXRvciNmb2N1c2Bcblx0ICogaHR0cHM6Ly9ja2VkaXRvci5jb20vZG9jcy9ja2VkaXRvcjQvbGF0ZXN0L2FwaS9DS0VESVRPUl9lZGl0b3IuaHRtbCNldmVudC1mb2N1c1xuXHQgKiBldmVudC5cblx0ICovXG5cdEBPdXRwdXQoKSBmb2N1cyA9IG5ldyBFdmVudEVtaXR0ZXI8Q0tFZGl0b3I0LkV2ZW50SW5mbz4oKTtcblxuXHQvKipcblx0ICogRmlyZXMgd2hlbiB0aGUgZWRpdGluZyB2aWV3IG9mIHRoZSBlZGl0b3IgaXMgYmx1cnJlZC4gSXQgY29ycmVzcG9uZHMgd2l0aCB0aGUgYGVkaXRvciNibHVyYFxuXHQgKiBodHRwczovL2NrZWRpdG9yLmNvbS9kb2NzL2NrZWRpdG9yNC9sYXRlc3QvYXBpL0NLRURJVE9SX2VkaXRvci5odG1sI2V2ZW50LWJsdXJcblx0ICogZXZlbnQuXG5cdCAqL1xuXHRAT3V0cHV0KCkgYmx1ciA9IG5ldyBFdmVudEVtaXR0ZXI8Q0tFZGl0b3I0LkV2ZW50SW5mbz4oKTtcblxuXHQvKipcblx0ICogVGhlIGluc3RhbmNlIG9mIHRoZSBlZGl0b3IgY3JlYXRlZCBieSB0aGlzIGNvbXBvbmVudC5cblx0ICovXG5cdGluc3RhbmNlOiBhbnk7XG5cblx0LyoqXG5cdCAqIElmIHRoZSBjb21wb25lbnQgaXMgcmVhZOKAk29ubHkgYmVmb3JlIHRoZSBlZGl0b3IgaW5zdGFuY2UgaXMgY3JlYXRlZCwgaXQgcmVtZW1iZXJzIHRoYXQgc3RhdGUsXG5cdCAqIHNvIHRoZSBlZGl0b3IgY2FuIGJlY29tZSByZWFk4oCTb25seSBvbmNlIGl0IGlzIHJlYWR5LlxuXHQgKi9cblx0cHJpdmF0ZSBfcmVhZE9ubHk6IGJvb2xlYW4gPSBudWxsO1xuXG5cdC8qKlxuXHQgKiBBIGNhbGxiYWNrIGV4ZWN1dGVkIHdoZW4gdGhlIGNvbnRlbnQgb2YgdGhlIGVkaXRvciBjaGFuZ2VzLiBQYXJ0IG9mIHRoZVxuXHQgKiBgQ29udHJvbFZhbHVlQWNjZXNzb3JgIChodHRwczovL2FuZ3VsYXIuaW8vYXBpL2Zvcm1zL0NvbnRyb2xWYWx1ZUFjY2Vzc29yKSBpbnRlcmZhY2UuXG5cdCAqXG5cdCAqIE5vdGU6IFVuc2V0IHVubGVzcyB0aGUgY29tcG9uZW50IHVzZXMgdGhlIGBuZ01vZGVsYC5cblx0ICovXG5cdG9uQ2hhbmdlPzogKCBkYXRhOiBzdHJpbmcgKSA9PiB2b2lkO1xuXG5cdC8qKlxuXHQgKiBBIGNhbGxiYWNrIGV4ZWN1dGVkIHdoZW4gdGhlIGVkaXRvciBoYXMgYmVlbiBibHVycmVkLiBQYXJ0IG9mIHRoZVxuXHQgKiBgQ29udHJvbFZhbHVlQWNjZXNzb3JgIChodHRwczovL2FuZ3VsYXIuaW8vYXBpL2Zvcm1zL0NvbnRyb2xWYWx1ZUFjY2Vzc29yKSBpbnRlcmZhY2UuXG5cdCAqXG5cdCAqIE5vdGU6IFVuc2V0IHVubGVzcyB0aGUgY29tcG9uZW50IHVzZXMgdGhlIGBuZ01vZGVsYC5cblx0ICovXG5cdG9uVG91Y2hlZD86ICgpID0+IHZvaWQ7XG5cblx0cHJpdmF0ZSBfZGF0YTogc3RyaW5nID0gbnVsbDtcblxuXHQvKipcblx0ICogQ0tFZGl0b3IgNCBzY3JpcHQgdXJsIGFkZHJlc3MuIFNjcmlwdCB3aWxsIGJlIGxvYWRlZCBvbmx5IGlmIENLRURJVE9SIG5hbWVzcGFjZSBpcyBtaXNzaW5nLlxuXHQgKlxuXHQgKiBEZWZhdWx0cyB0byAnaHR0cHM6Ly9jZG4uY2tlZGl0b3IuY29tLzQuMTQuMC9zdGFuZGFyZC1hbGwvY2tlZGl0b3IuanMnXG5cdCAqL1xuXHRASW5wdXQoKSBlZGl0b3JVcmwgPSAnaHR0cHM6Ly9jZG4uY2tlZGl0b3IuY29tLzQuMTQuMC9zdGFuZGFyZC1hbGwvY2tlZGl0b3IuanMnO1xuXG5cdGNvbnN0cnVjdG9yKCBwcml2YXRlIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsIHByaXZhdGUgbmdab25lOiBOZ1pvbmUgKSB7XG5cdH1cblxuXHRuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG5cdFx0Z2V0RWRpdG9yTmFtZXNwYWNlKCB0aGlzLmVkaXRvclVybCApLnRoZW4oICgpID0+IHtcblx0XHRcdHRoaXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCB0aGlzLmNyZWF0ZUVkaXRvci5iaW5kKCB0aGlzICkgKTtcblx0XHR9ICkuY2F0Y2goIHdpbmRvdy5jb25zb2xlLmVycm9yICk7XG5cdH1cblxuXHRuZ09uRGVzdHJveSgpOiB2b2lkIHtcblx0XHR0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhciggKCkgPT4ge1xuXHRcdFx0aWYgKCB0aGlzLmluc3RhbmNlICkge1xuXHRcdFx0XHR0aGlzLmluc3RhbmNlLmRlc3Ryb3koKTtcblx0XHRcdFx0dGhpcy5pbnN0YW5jZSA9IG51bGw7XG5cdFx0XHR9XG5cdFx0fSApO1xuXHR9XG5cblx0d3JpdGVWYWx1ZSggdmFsdWU6IHN0cmluZyApOiB2b2lkIHtcblx0XHR0aGlzLmRhdGEgPSB2YWx1ZTtcblx0fVxuXG5cdHJlZ2lzdGVyT25DaGFuZ2UoIGNhbGxiYWNrOiAoIGRhdGE6IHN0cmluZyApID0+IHZvaWQgKTogdm9pZCB7XG5cdFx0dGhpcy5vbkNoYW5nZSA9IGNhbGxiYWNrO1xuXHR9XG5cblx0cmVnaXN0ZXJPblRvdWNoZWQoIGNhbGxiYWNrOiAoKSA9PiB2b2lkICk6IHZvaWQge1xuXHRcdHRoaXMub25Ub3VjaGVkID0gY2FsbGJhY2s7XG5cdH1cblxuXHRwcml2YXRlIGNyZWF0ZUVkaXRvcigpOiB2b2lkIHtcblx0XHRjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggdGhpcy50YWdOYW1lICk7XG5cdFx0dGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuYXBwZW5kQ2hpbGQoIGVsZW1lbnQgKTtcblxuXHRcdGlmICggdGhpcy50eXBlID09PSBDS0VkaXRvcjQuRWRpdG9yVHlwZS5ESVZBUkVBICkge1xuXHRcdFx0dGhpcy5jb25maWcgPSB0aGlzLmVuc3VyZURpdmFyZWFQbHVnaW4oIHRoaXMuY29uZmlnIHx8IHt9ICk7XG5cdFx0fVxuXG5cdFx0Q0tFRElUT1Iub24oJ2luc3RhbmNlQ3JlYXRlZCcsIGV2dCA9PiB7XG5cdFx0XHR0aGlzLm5nWm9uZS5ydW4oICgpID0+IHtcblx0XHRcdFx0dGhpcy5jcmVhdGVkLmVtaXQoIGV2dCApO1xuXHRcdFx0fSApO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgaW5zdGFuY2U6IENLRWRpdG9yNC5FZGl0b3IgPSB0aGlzLnR5cGUgPT09IENLRWRpdG9yNC5FZGl0b3JUeXBlLklOTElORVxuXHRcdFx0PyBDS0VESVRPUi5pbmxpbmUoIGVsZW1lbnQsIHRoaXMuY29uZmlnIClcblx0XHRcdDogQ0tFRElUT1IucmVwbGFjZSggZWxlbWVudCwgdGhpcy5jb25maWcgKTtcblxuXG5cdFx0aW5zdGFuY2Uub25jZSggJ2luc3RhbmNlUmVhZHknLCBldnQgPT4ge1xuXHRcdFx0dGhpcy5pbnN0YW5jZSA9IGluc3RhbmNlO1xuXG5cdFx0XHQvLyBSZWFkIG9ubHkgc3RhdGUgbWF5IGNoYW5nZSBkdXJpbmcgaW5zdGFuY2UgaW5pdGlhbGl6YXRpb24uXG5cdFx0XHR0aGlzLnJlYWRPbmx5ID0gdGhpcy5fcmVhZE9ubHkgIT09IG51bGwgPyB0aGlzLl9yZWFkT25seSA6IHRoaXMuaW5zdGFuY2UucmVhZE9ubHk7XG5cblx0XHRcdHRoaXMuc3Vic2NyaWJlKCB0aGlzLmluc3RhbmNlICk7XG5cblx0XHRcdGNvbnN0IHVuZG8gPSBpbnN0YW5jZS51bmRvTWFuYWdlcjtcblxuXHRcdFx0aWYgKCB0aGlzLmRhdGEgIT09IG51bGwgKSB7XG5cdFx0XHRcdHVuZG8gJiYgdW5kby5sb2NrKCk7XG5cblx0XHRcdFx0aW5zdGFuY2Uuc2V0RGF0YSggdGhpcy5kYXRhLCB7IGNhbGxiYWNrOiAoKSA9PiB7XG5cdFx0XHRcdFx0Ly8gTG9ja2luZyB1bmRvTWFuYWdlciBwcmV2ZW50cyAnY2hhbmdlJyBldmVudC5cblx0XHRcdFx0XHQvLyBUcmlnZ2VyIGl0IG1hbnVhbGx5IHRvIHVwZGF0ZWQgYm91bmQgZGF0YS5cblx0XHRcdFx0XHRpZiAoIHRoaXMuZGF0YSAhPT0gaW5zdGFuY2UuZ2V0RGF0YSgpICkge1xuXHRcdFx0XHRcdFx0dW5kbyA/IGluc3RhbmNlLmZpcmUoICdjaGFuZ2UnICkgOiBpbnN0YW5jZS5maXJlKCAnZGF0YVJlYWR5JyApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR1bmRvICYmIHVuZG8udW5sb2NrKCk7XG5cblx0XHRcdFx0XHR0aGlzLm5nWm9uZS5ydW4oICgpID0+IHtcblx0XHRcdFx0XHRcdHRoaXMucmVhZHkuZW1pdCggZXZ0ICk7XG5cdFx0XHRcdFx0fSApO1xuXHRcdFx0XHR9IH0gKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMubmdab25lLnJ1biggKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMucmVhZHkuZW1pdCggZXZ0ICk7XG5cdFx0XHRcdH0gKTtcblx0XHRcdH1cblx0XHR9ICk7XG5cdH1cblxuXHRwcml2YXRlIHN1YnNjcmliZSggZWRpdG9yOiBhbnkgKTogdm9pZCB7XG5cdFx0ZWRpdG9yLm9uKCAnZm9jdXMnLCBldnQgPT4ge1xuXHRcdFx0dGhpcy5uZ1pvbmUucnVuKCAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuZm9jdXMuZW1pdCggZXZ0ICk7XG5cdFx0XHR9ICk7XG5cdFx0fSApO1xuXG5cdFx0ZWRpdG9yLm9uKCAnYmx1cicsIGV2dCA9PiB7XG5cdFx0XHR0aGlzLm5nWm9uZS5ydW4oICgpID0+IHtcblx0XHRcdFx0aWYgKCB0aGlzLm9uVG91Y2hlZCApIHtcblx0XHRcdFx0XHR0aGlzLm9uVG91Y2hlZCgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGhpcy5ibHVyLmVtaXQoIGV2dCApO1xuXHRcdFx0fSApO1xuXHRcdH0gKTtcblxuXHRcdGVkaXRvci5vbiggJ2RhdGFSZWFkeScsIHRoaXMucHJvcGFnYXRlQ2hhbmdlLCB0aGlzICk7XG5cblx0XHRpZiAoIHRoaXMuaW5zdGFuY2UudW5kb01hbmFnZXIgKSB7XG5cdFx0XHRlZGl0b3Iub24oICdjaGFuZ2UnLCB0aGlzLnByb3BhZ2F0ZUNoYW5nZSwgdGhpcyApO1xuXHRcdH1cblx0XHQvLyBJZiAndW5kbycgcGx1Z2luIGlzIG5vdCBsb2FkZWQsIGxpc3RlbiB0byAnc2VsZWN0aW9uQ2hlY2snIGV2ZW50IGluc3RlYWQuICgjNTQpLlxuXHRcdGVsc2Uge1xuXHRcdFx0ZWRpdG9yLm9uKCAnc2VsZWN0aW9uQ2hlY2snLCB0aGlzLnByb3BhZ2F0ZUNoYW5nZSwgdGhpcyApO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgcHJvcGFnYXRlQ2hhbmdlKCBldmVudDogYW55ICk6IHZvaWQge1xuXHRcdHRoaXMubmdab25lLnJ1biggKCkgPT4ge1xuXHRcdFx0Y29uc3QgbmV3RGF0YSA9IHRoaXMuaW5zdGFuY2UuZ2V0RGF0YSgpO1xuXG5cdFx0XHRpZiAoIGV2ZW50Lm5hbWUgPT0gJ2NoYW5nZScgKSB7XG5cdFx0XHRcdHRoaXMuY2hhbmdlLmVtaXQoIGV2ZW50ICk7XG5cdFx0XHR9IGVsc2UgaWYgKCBldmVudC5uYW1lID09ICdkYXRhUmVhZHknICkge1xuXHRcdFx0XHR0aGlzLmRhdGFSZWFkeS5lbWl0KCBldmVudCApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIG5ld0RhdGEgPT09IHRoaXMuZGF0YSApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLl9kYXRhID0gbmV3RGF0YTtcblx0XHRcdHRoaXMuZGF0YUNoYW5nZS5lbWl0KCBuZXdEYXRhICk7XG5cblx0XHRcdGlmICggdGhpcy5vbkNoYW5nZSApIHtcblx0XHRcdFx0dGhpcy5vbkNoYW5nZSggbmV3RGF0YSApO1xuXHRcdFx0fVxuXHRcdH0gKTtcblx0fVxuXG5cdHByaXZhdGUgZW5zdXJlRGl2YXJlYVBsdWdpbiggY29uZmlnOiBDS0VkaXRvcjQuQ29uZmlnICk6IENLRWRpdG9yNC5Db25maWcge1xuXHRcdGxldCB7IGV4dHJhUGx1Z2lucywgcmVtb3ZlUGx1Z2lucyB9ID0gY29uZmlnO1xuXG5cdFx0ZXh0cmFQbHVnaW5zID0gdGhpcy5yZW1vdmVQbHVnaW4oIGV4dHJhUGx1Z2lucywgJ2RpdmFyZWEnICkgfHwgJyc7XG5cdFx0ZXh0cmFQbHVnaW5zID0gZXh0cmFQbHVnaW5zLmNvbmNhdCggdHlwZW9mIGV4dHJhUGx1Z2lucyA9PT0gJ3N0cmluZycgPyAnLGRpdmFyZWEnIDogJ2RpdmFyZWEnICk7XG5cblx0XHRpZiAoIHJlbW92ZVBsdWdpbnMgJiYgcmVtb3ZlUGx1Z2lucy5pbmNsdWRlcyggJ2RpdmFyZWEnICkgKSB7XG5cblx0XHRcdHJlbW92ZVBsdWdpbnMgPSB0aGlzLnJlbW92ZVBsdWdpbiggcmVtb3ZlUGx1Z2lucywgJ2RpdmFyZWEnICk7XG5cblx0XHRcdGNvbnNvbGUud2FybiggJ1tDS0VESVRPUl0gZGl2YXJlYSBwbHVnaW4gaXMgcmVxdWlyZWQgdG8gaW5pdGlhbGl6ZSBlZGl0b3IgdXNpbmcgQW5ndWxhciBpbnRlZ3JhdGlvbi4nICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIE9iamVjdC5hc3NpZ24oIHt9LCBjb25maWcsIHsgZXh0cmFQbHVnaW5zLCByZW1vdmVQbHVnaW5zIH0gKTtcblx0fVxuXG5cdHByaXZhdGUgcmVtb3ZlUGx1Z2luKCBwbHVnaW5zOiBzdHJpbmcgfCBzdHJpbmdbXSwgdG9SZW1vdmU6IHN0cmluZyApOiBzdHJpbmcgfCBzdHJpbmdbXSB7XG5cdFx0aWYgKCAhcGx1Z2lucyApIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdGNvbnN0IGlzU3RyaW5nID0gdHlwZW9mIHBsdWdpbnMgPT09ICdzdHJpbmcnO1xuXG5cdFx0aWYgKCBpc1N0cmluZyApIHtcblx0XHRcdHBsdWdpbnMgPSAoIHBsdWdpbnMgYXMgc3RyaW5nICkuc3BsaXQoICcsJyApO1xuXHRcdH1cblxuXHRcdHBsdWdpbnMgPSAoIHBsdWdpbnMgYXMgc3RyaW5nW10gKS5maWx0ZXIoIHBsdWdpbiA9PiBwbHVnaW4gIT09IHRvUmVtb3ZlICk7XG5cblx0XHRpZiAoIGlzU3RyaW5nICkge1xuXHRcdFx0cGx1Z2lucyA9ICggcGx1Z2lucyBhcyBzdHJpbmdbXSApLmpvaW4oICcsJyApO1xuXHRcdH1cblxuXHRcdHJldHVybiBwbHVnaW5zO1xuXHR9XG59XG4iXX0=