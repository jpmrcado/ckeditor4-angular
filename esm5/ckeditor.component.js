/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */
import * as tslib_1 from "tslib";
import { Component, NgZone, Input, Output, EventEmitter, forwardRef, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { getEditorNamespace } from './ckeditor.helpers';
var CKEditorComponent = /** @class */ (function () {
    function CKEditorComponent(elementRef, ngZone) {
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
    CKEditorComponent_1 = CKEditorComponent;
    Object.defineProperty(CKEditorComponent.prototype, "data", {
        get: function () {
            return this._data;
        },
        /**
         * Keeps track of the editor's data.
         *
         * It's also decorated as an input which is useful when not using the ngModel.
         *
         * See https://angular.io/api/forms/NgModel to learn more.
         */
        set: function (data) {
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
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CKEditorComponent.prototype, "readOnly", {
        get: function () {
            if (this.instance) {
                return this.instance.readOnly;
            }
            return this._readOnly;
        },
        /**
         * When set `true`, the editor becomes read-only.
         * https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_editor.html#property-readOnly
         * to learn more.
         */
        set: function (isReadOnly) {
            if (this.instance) {
                this.instance.setReadOnly(isReadOnly);
                return;
            }
            // Delay setting read-only state until editor initialization.
            this._readOnly = isReadOnly;
        },
        enumerable: true,
        configurable: true
    });
    CKEditorComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        getEditorNamespace(this.editorUrl).then(function () {
            _this.ngZone.runOutsideAngular(_this.createEditor.bind(_this));
        }).catch(window.console.error);
    };
    CKEditorComponent.prototype.ngOnDestroy = function () {
        var _this = this;
        this.ngZone.runOutsideAngular(function () {
            if (_this.instance) {
                _this.instance.destroy();
                _this.instance = null;
            }
        });
    };
    CKEditorComponent.prototype.writeValue = function (value) {
        this.data = value;
    };
    CKEditorComponent.prototype.registerOnChange = function (callback) {
        this.onChange = callback;
    };
    CKEditorComponent.prototype.registerOnTouched = function (callback) {
        this.onTouched = callback;
    };
    CKEditorComponent.prototype.createEditor = function () {
        var _this = this;
        var element = document.createElement(this.tagName);
        this.elementRef.nativeElement.appendChild(element);
        if (this.type === "divarea" /* DIVAREA */) {
            this.config = this.ensureDivareaPlugin(this.config || {});
        }
        CKEDITOR.on('instanceCreated', function (evt) {
            _this.ngZone.run(function () {
                _this.created.emit(evt);
            });
        });
        var instance = this.type === "inline" /* INLINE */
            ? CKEDITOR.inline(element, this.config)
            : CKEDITOR.replace(element, this.config);
        instance.UI = this.UI;
        instance.once('instanceReady', function (evt) {
            _this.instance = instance;
            // Read only state may change during instance initialization.
            _this.readOnly = _this._readOnly !== null ? _this._readOnly : _this.instance.readOnly;
            _this.subscribe(_this.instance);
            var undo = instance.undoManager;
            if (_this.data !== null) {
                undo && undo.lock();
                instance.setData(_this.data, { callback: function () {
                        // Locking undoManager prevents 'change' event.
                        // Trigger it manually to updated bound data.
                        if (_this.data !== instance.getData()) {
                            undo ? instance.fire('change') : instance.fire('dataReady');
                        }
                        undo && undo.unlock();
                        _this.ngZone.run(function () {
                            _this.ready.emit(evt);
                        });
                    } });
            }
            else {
                _this.ngZone.run(function () {
                    _this.ready.emit(evt);
                });
            }
        });
    };
    CKEditorComponent.prototype.subscribe = function (editor) {
        var _this = this;
        editor.on('focus', function (evt) {
            _this.ngZone.run(function () {
                _this.focus.emit(evt);
            });
        });
        editor.on('blur', function (evt) {
            _this.ngZone.run(function () {
                if (_this.onTouched) {
                    _this.onTouched();
                }
                _this.blur.emit(evt);
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
    };
    CKEditorComponent.prototype.propagateChange = function (event) {
        var _this = this;
        this.ngZone.run(function () {
            var newData = _this.instance.getData();
            if (event.name == 'change') {
                _this.change.emit(event);
            }
            else if (event.name == 'dataReady') {
                _this.dataReady.emit(event);
            }
            if (newData === _this.data) {
                return;
            }
            _this._data = newData;
            _this.dataChange.emit(newData);
            if (_this.onChange) {
                _this.onChange(newData);
            }
        });
    };
    CKEditorComponent.prototype.ensureDivareaPlugin = function (config) {
        var extraPlugins = config.extraPlugins, removePlugins = config.removePlugins;
        extraPlugins = this.removePlugin(extraPlugins, 'divarea') || '';
        extraPlugins = extraPlugins.concat(typeof extraPlugins === 'string' ? ',divarea' : 'divarea');
        if (removePlugins && removePlugins.includes('divarea')) {
            removePlugins = this.removePlugin(removePlugins, 'divarea');
            console.warn('[CKEDITOR] divarea plugin is required to initialize editor using Angular integration.');
        }
        return Object.assign({}, config, { extraPlugins: extraPlugins, removePlugins: removePlugins });
    };
    CKEditorComponent.prototype.removePlugin = function (plugins, toRemove) {
        if (!plugins) {
            return null;
        }
        var isString = typeof plugins === 'string';
        if (isString) {
            plugins = plugins.split(',');
        }
        plugins = plugins.filter(function (plugin) { return plugin !== toRemove; });
        if (isString) {
            plugins = plugins.join(',');
        }
        return plugins;
    };
    var CKEditorComponent_1;
    CKEditorComponent.ctorParameters = function () { return [
        { type: ElementRef },
        { type: NgZone }
    ]; };
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
                    useExisting: forwardRef(function () { return CKEditorComponent_1; }),
                    multi: true,
                }
            ]
        })
    ], CKEditorComponent);
    return CKEditorComponent;
}());
export { CKEditorComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2tlZGl0b3IuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vY2tlZGl0b3I0LWFuZ3VsYXIvIiwic291cmNlcyI6WyJja2VkaXRvci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHOztBQUVILE9BQU8sRUFDTixTQUFTLEVBQ1QsTUFBTSxFQUNOLEtBQUssRUFDTCxNQUFNLEVBQ04sWUFBWSxFQUNaLFVBQVUsRUFDVixVQUFVLEVBQ1YsYUFBYSxFQUFFLFNBQVMsRUFDeEIsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUVOLGlCQUFpQixFQUNqQixNQUFNLGdCQUFnQixDQUFDO0FBRXhCLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBa0J4RDtJQW9LQywyQkFBcUIsVUFBc0IsRUFBVSxNQUFjO1FBQTlDLGVBQVUsR0FBVixVQUFVLENBQVk7UUFBVSxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBNUpuRTs7OztXQUlHO1FBQ00sWUFBTyxHQUFHLFVBQVUsQ0FBQztRQUU5Qjs7Ozs7Ozs7O1dBU0c7UUFDTSxTQUFJLDJCQUFzRDtRQUUxRCxPQUFFLDJCQUFzRDtRQW9EakU7Ozs7V0FJRztRQUNPLFVBQUssR0FBRyxJQUFJLFlBQVksRUFBdUIsQ0FBQztRQUdoRCxZQUFPLEdBQUcsSUFBSSxZQUFZLEVBQXVCLENBQUM7UUFFNUQ7Ozs7O1dBS0c7UUFDTyxjQUFTLEdBQUcsSUFBSSxZQUFZLEVBQXVCLENBQUM7UUFFOUQ7Ozs7OztXQU1HO1FBQ08sV0FBTSxHQUFHLElBQUksWUFBWSxFQUF1QixDQUFDO1FBRTNEOzs7OztXQUtHO1FBQ08sZUFBVSxHQUFHLElBQUksWUFBWSxFQUF1QixDQUFDO1FBRS9EOzs7O1dBSUc7UUFDTyxVQUFLLEdBQUcsSUFBSSxZQUFZLEVBQXVCLENBQUM7UUFFMUQ7Ozs7V0FJRztRQUNPLFNBQUksR0FBRyxJQUFJLFlBQVksRUFBdUIsQ0FBQztRQU96RDs7O1dB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QUFDLElBQUksQ0FBRSxHQUFHLENBQUUsQ0FBQztTQUM5QztRQUVELE9BQU8sT0FBTyxDQUFDO0lBQ2hCLENBQUM7OztnQkF4S2dDLFVBQVU7Z0JBQWtCLE1BQU07O0lBOUoxRDtRQUFSLEtBQUssRUFBRTtxREFBMkI7SUFPMUI7UUFBUixLQUFLLEVBQUU7c0RBQXNCO0lBWXJCO1FBQVIsS0FBSyxFQUFFO21EQUEyRDtJQUUxRDtRQUFSLEtBQUssRUFBRTtpREFBeUQ7SUFTeEQ7UUFBUixLQUFLLEVBQUU7aURBY1A7SUFXUTtRQUFSLEtBQUssRUFBRTtxREFRUDtJQWVTO1FBQVQsTUFBTSxFQUFFO29EQUFpRDtJQUdoRDtRQUFULE1BQU0sRUFBRTtzREFBbUQ7SUFRbEQ7UUFBVCxNQUFNLEVBQUU7d0RBQXFEO0lBU3BEO1FBQVQsTUFBTSxFQUFFO3FEQUFrRDtJQVFqRDtRQUFULE1BQU0sRUFBRTt5REFBc0Q7SUFPckQ7UUFBVCxNQUFNLEVBQUU7b0RBQWlEO0lBT2hEO1FBQVQsTUFBTSxFQUFFO21EQUFnRDtJQW9DaEQ7UUFBUixLQUFLLEVBQUU7d0RBQXdFO0lBbEtwRSxpQkFBaUI7UUFaN0IsU0FBUyxDQUFFO1lBQ1gsUUFBUSxFQUFFLFVBQVU7WUFDcEIsUUFBUSxFQUFFLDZCQUE2QjtZQUV2QyxTQUFTLEVBQUU7Z0JBQ1Y7b0JBQ0MsT0FBTyxFQUFFLGlCQUFpQjtvQkFDMUIsV0FBVyxFQUFFLFVBQVUsQ0FBRSxjQUFNLE9BQUEsbUJBQWlCLEVBQWpCLENBQWlCLENBQUU7b0JBQ2xELEtBQUssRUFBRSxJQUFJO2lCQUNYO2FBQ0Q7U0FDRCxDQUFFO09BQ1UsaUJBQWlCLENBNlU3QjtJQUFELHdCQUFDO0NBQUEsQUE3VUQsSUE2VUM7U0E3VVksaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZSBDb3B5cmlnaHQgKGMpIDIwMDMtMjAyMCwgQ0tTb3VyY2UgLSBGcmVkZXJpY28gS25hYmJlbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIEZvciBsaWNlbnNpbmcsIHNlZSBMSUNFTlNFLm1kLlxuICovXG5cbmltcG9ydCB7XG5cdENvbXBvbmVudCxcblx0Tmdab25lLFxuXHRJbnB1dCxcblx0T3V0cHV0LFxuXHRFdmVudEVtaXR0ZXIsXG5cdGZvcndhcmRSZWYsXG5cdEVsZW1lbnRSZWYsXG5cdEFmdGVyVmlld0luaXQsIE9uRGVzdHJveVxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtcblx0Q29udHJvbFZhbHVlQWNjZXNzb3IsXG5cdE5HX1ZBTFVFX0FDQ0VTU09SXG59IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcblxuaW1wb3J0IHsgZ2V0RWRpdG9yTmFtZXNwYWNlIH0gZnJvbSAnLi9ja2VkaXRvci5oZWxwZXJzJztcblxuaW1wb3J0IHsgQ0tFZGl0b3I0IH0gZnJvbSAnLi9ja2VkaXRvcic7XG5cbmRlY2xhcmUgbGV0IENLRURJVE9SOiBhbnk7XG5cbkBDb21wb25lbnQoIHtcblx0c2VsZWN0b3I6ICdja2VkaXRvcicsXG5cdHRlbXBsYXRlOiAnPG5nLXRlbXBsYXRlPjwvbmctdGVtcGxhdGU+JyxcblxuXHRwcm92aWRlcnM6IFtcblx0XHR7XG5cdFx0XHRwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcblx0XHRcdHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCAoKSA9PiBDS0VkaXRvckNvbXBvbmVudCApLFxuXHRcdFx0bXVsdGk6IHRydWUsXG5cdFx0fVxuXHRdXG59IClcbmV4cG9ydCBjbGFzcyBDS0VkaXRvckNvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSwgQ29udHJvbFZhbHVlQWNjZXNzb3Ige1xuXHQvKipcblx0ICogVGhlIGNvbmZpZ3VyYXRpb24gb2YgdGhlIGVkaXRvci5cblx0ICogU2VlIGh0dHBzOi8vY2tlZGl0b3IuY29tL2RvY3MvY2tlZGl0b3I0L2xhdGVzdC9hcGkvQ0tFRElUT1JfY29uZmlnLmh0bWxcblx0ICogdG8gbGVhcm4gbW9yZS5cblx0ICovXG5cdEBJbnB1dCgpIGNvbmZpZz86IENLRWRpdG9yNC5Db25maWc7XG5cblx0LyoqXG5cdCAqIFRhZyBuYW1lIG9mIHRoZSBlZGl0b3IgY29tcG9uZW50LlxuXHQgKlxuXHQgKiBUaGUgZGVmYXVsdCB0YWcgaXMgYHRleHRhcmVhYC5cblx0ICovXG5cdEBJbnB1dCgpIHRhZ05hbWUgPSAndGV4dGFyZWEnO1xuXG5cdC8qKlxuXHQgKiBUaGUgdHlwZSBvZiB0aGUgZWRpdG9yIGludGVyZmFjZS5cblx0ICpcblx0ICogQnkgZGVmYXVsdCBlZGl0b3IgaW50ZXJmYWNlIHdpbGwgYmUgaW5pdGlhbGl6ZWQgYXMgYGRpdmFyZWFgIGVkaXRvciB3aGljaCBpcyBhbiBpbmxpbmUgZWRpdG9yIHdpdGggZml4ZWQgVUkuXG5cdCAqIFlvdSBjYW4gY2hhbmdlIGludGVyZmFjZSB0eXBlIGJ5IGNob29zaW5nIGJldHdlZW4gYGRpdmFyZWFgIGFuZCBgaW5saW5lYCBlZGl0b3IgaW50ZXJmYWNlIHR5cGVzLlxuXHQgKlxuXHQgKiBTZWUgaHR0cHM6Ly9ja2VkaXRvci5jb20vZG9jcy9ja2VkaXRvcjQvbGF0ZXN0L2d1aWRlL2Rldl91aXR5cGVzLmh0bWxcblx0ICogYW5kIGh0dHBzOi8vY2tlZGl0b3IuY29tL2RvY3MvY2tlZGl0b3I0L2xhdGVzdC9leGFtcGxlcy9maXhlZHVpLmh0bWxcblx0ICogdG8gbGVhcm4gbW9yZS5cblx0ICovXG5cdEBJbnB1dCgpIHR5cGU6IENLRWRpdG9yNC5FZGl0b3JUeXBlID0gQ0tFZGl0b3I0LkVkaXRvclR5cGUuQ0xBU1NJQztcblxuXHRASW5wdXQoKSBVSTogQ0tFZGl0b3I0LkVkaXRvclR5cGUgPSBDS0VkaXRvcjQuRWRpdG9yVHlwZS5DTEFTU0lDO1xuXG5cdC8qKlxuXHQgKiBLZWVwcyB0cmFjayBvZiB0aGUgZWRpdG9yJ3MgZGF0YS5cblx0ICpcblx0ICogSXQncyBhbHNvIGRlY29yYXRlZCBhcyBhbiBpbnB1dCB3aGljaCBpcyB1c2VmdWwgd2hlbiBub3QgdXNpbmcgdGhlIG5nTW9kZWwuXG5cdCAqXG5cdCAqIFNlZSBodHRwczovL2FuZ3VsYXIuaW8vYXBpL2Zvcm1zL05nTW9kZWwgdG8gbGVhcm4gbW9yZS5cblx0ICovXG5cdEBJbnB1dCgpIHNldCBkYXRhKCBkYXRhOiBzdHJpbmcgKSB7XG5cdFx0aWYgKCBkYXRhID09PSB0aGlzLl9kYXRhICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5pbnN0YW5jZSApIHtcblx0XHRcdHRoaXMuaW5zdGFuY2Uuc2V0RGF0YSggZGF0YSApO1xuXHRcdFx0Ly8gRGF0YSBtYXkgYmUgY2hhbmdlZCBieSBBQ0YuXG5cdFx0XHR0aGlzLl9kYXRhID0gdGhpcy5pbnN0YW5jZS5nZXREYXRhKCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5fZGF0YSA9IGRhdGE7XG5cblx0fVxuXG5cdGdldCBkYXRhKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHRoaXMuX2RhdGE7XG5cdH1cblxuXHQvKipcblx0ICogV2hlbiBzZXQgYHRydWVgLCB0aGUgZWRpdG9yIGJlY29tZXMgcmVhZC1vbmx5LlxuXHQgKiBodHRwczovL2NrZWRpdG9yLmNvbS9kb2NzL2NrZWRpdG9yNC9sYXRlc3QvYXBpL0NLRURJVE9SX2VkaXRvci5odG1sI3Byb3BlcnR5LXJlYWRPbmx5XG5cdCAqIHRvIGxlYXJuIG1vcmUuXG5cdCAqL1xuXHRASW5wdXQoKSBzZXQgcmVhZE9ubHkoIGlzUmVhZE9ubHk6IGJvb2xlYW4gKSB7XG5cdFx0aWYgKCB0aGlzLmluc3RhbmNlICkge1xuXHRcdFx0dGhpcy5pbnN0YW5jZS5zZXRSZWFkT25seSggaXNSZWFkT25seSApO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIERlbGF5IHNldHRpbmcgcmVhZC1vbmx5IHN0YXRlIHVudGlsIGVkaXRvciBpbml0aWFsaXphdGlvbi5cblx0XHR0aGlzLl9yZWFkT25seSA9IGlzUmVhZE9ubHk7XG5cdH1cblxuXHRnZXQgcmVhZE9ubHkoKTogYm9vbGVhbiB7XG5cdFx0aWYgKCB0aGlzLmluc3RhbmNlICkge1xuXHRcdFx0cmV0dXJuIHRoaXMuaW5zdGFuY2UucmVhZE9ubHk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuX3JlYWRPbmx5O1xuXHR9XG5cblx0LyoqXG5cdCAqIEZpcmVzIHdoZW4gdGhlIGVkaXRvciBpcyByZWFkeS4gSXQgY29ycmVzcG9uZHMgd2l0aCB0aGUgYGVkaXRvciNpbnN0YW5jZVJlYWR5YFxuXHQgKiBodHRwczovL2NrZWRpdG9yLmNvbS9kb2NzL2NrZWRpdG9yNC9sYXRlc3QvYXBpL0NLRURJVE9SX2VkaXRvci5odG1sI2V2ZW50LWluc3RhbmNlUmVhZHlcblx0ICogZXZlbnQuXG5cdCAqL1xuXHRAT3V0cHV0KCkgcmVhZHkgPSBuZXcgRXZlbnRFbWl0dGVyPENLRWRpdG9yNC5FdmVudEluZm8+KCk7XG5cblx0XG5cdEBPdXRwdXQoKSBjcmVhdGVkID0gbmV3IEV2ZW50RW1pdHRlcjxDS0VkaXRvcjQuRXZlbnRJbmZvPigpO1xuXG5cdC8qKlxuXHQgKiBGaXJlcyB3aGVuIHRoZSBlZGl0b3IgZGF0YSBpcyBsb2FkZWQsIGUuZy4gYWZ0ZXIgY2FsbGluZyBzZXREYXRhKClcblx0ICogaHR0cHM6Ly9ja2VkaXRvci5jb20vZG9jcy9ja2VkaXRvcjQvbGF0ZXN0L2FwaS9DS0VESVRPUl9lZGl0b3IuaHRtbCNtZXRob2Qtc2V0RGF0YVxuXHQgKiBlZGl0b3IncyBtZXRob2QuIEl0IGNvcnJlc3BvbmRzIHdpdGggdGhlIGBlZGl0b3IjZGF0YVJlYWR5YFxuXHQgKiBodHRwczovL2NrZWRpdG9yLmNvbS9kb2NzL2NrZWRpdG9yNC9sYXRlc3QvYXBpL0NLRURJVE9SX2VkaXRvci5odG1sI2V2ZW50LWRhdGFSZWFkeSBldmVudC5cblx0ICovXG5cdEBPdXRwdXQoKSBkYXRhUmVhZHkgPSBuZXcgRXZlbnRFbWl0dGVyPENLRWRpdG9yNC5FdmVudEluZm8+KCk7XG5cblx0LyoqXG5cdCAqIEZpcmVzIHdoZW4gdGhlIGNvbnRlbnQgb2YgdGhlIGVkaXRvciBoYXMgY2hhbmdlZC4gSXQgY29ycmVzcG9uZHMgd2l0aCB0aGUgYGVkaXRvciNjaGFuZ2VgXG5cdCAqIGh0dHBzOi8vY2tlZGl0b3IuY29tL2RvY3MvY2tlZGl0b3I0L2xhdGVzdC9hcGkvQ0tFRElUT1JfZWRpdG9yLmh0bWwjZXZlbnQtY2hhbmdlXG5cdCAqIGV2ZW50LiBGb3IgcGVyZm9ybWFuY2UgcmVhc29ucyB0aGlzIGV2ZW50IG1heSBiZSBjYWxsZWQgZXZlbiB3aGVuIGRhdGEgZGlkbid0IHJlYWxseSBjaGFuZ2VkLlxuXHQgKiBQbGVhc2Ugbm90ZSB0aGF0IHRoaXMgZXZlbnQgd2lsbCBvbmx5IGJlIGZpcmVkIHdoZW4gYHVuZG9gIHBsdWdpbiBpcyBsb2FkZWQuIElmIHlvdSBuZWVkIHRvXG5cdCAqIGxpc3RlbiBmb3IgZWRpdG9yIGNoYW5nZXMgKGUuZy4gZm9yIHR3by13YXkgZGF0YSBiaW5kaW5nKSwgdXNlIGBkYXRhQ2hhbmdlYCBldmVudCBpbnN0ZWFkLlxuXHQgKi9cblx0QE91dHB1dCgpIGNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8Q0tFZGl0b3I0LkV2ZW50SW5mbz4oKTtcblxuXHQvKipcblx0ICogRmlyZXMgd2hlbiB0aGUgY29udGVudCBvZiB0aGUgZWRpdG9yIGhhcyBjaGFuZ2VkLiBJbiBjb250cmFzdCB0byBgY2hhbmdlYCAtIG9ubHkgZW1pdHMgd2hlblxuXHQgKiBkYXRhIHJlYWxseSBjaGFuZ2VkIHRodXMgY2FuIGJlIHN1Y2Nlc3NmdWxseSB1c2VkIHdpdGggYFtkYXRhXWAgYW5kIHR3byB3YXkgYFsoZGF0YSldYCBiaW5kaW5nLlxuXHQgKlxuXHQgKiBTZWUgbW9yZTogaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL3RlbXBsYXRlLXN5bnRheCN0d28td2F5LWJpbmRpbmctLS1cblx0ICovXG5cdEBPdXRwdXQoKSBkYXRhQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxDS0VkaXRvcjQuRXZlbnRJbmZvPigpO1xuXG5cdC8qKlxuXHQgKiBGaXJlcyB3aGVuIHRoZSBlZGl0aW5nIHZpZXcgb2YgdGhlIGVkaXRvciBpcyBmb2N1c2VkLiBJdCBjb3JyZXNwb25kcyB3aXRoIHRoZSBgZWRpdG9yI2ZvY3VzYFxuXHQgKiBodHRwczovL2NrZWRpdG9yLmNvbS9kb2NzL2NrZWRpdG9yNC9sYXRlc3QvYXBpL0NLRURJVE9SX2VkaXRvci5odG1sI2V2ZW50LWZvY3VzXG5cdCAqIGV2ZW50LlxuXHQgKi9cblx0QE91dHB1dCgpIGZvY3VzID0gbmV3IEV2ZW50RW1pdHRlcjxDS0VkaXRvcjQuRXZlbnRJbmZvPigpO1xuXG5cdC8qKlxuXHQgKiBGaXJlcyB3aGVuIHRoZSBlZGl0aW5nIHZpZXcgb2YgdGhlIGVkaXRvciBpcyBibHVycmVkLiBJdCBjb3JyZXNwb25kcyB3aXRoIHRoZSBgZWRpdG9yI2JsdXJgXG5cdCAqIGh0dHBzOi8vY2tlZGl0b3IuY29tL2RvY3MvY2tlZGl0b3I0L2xhdGVzdC9hcGkvQ0tFRElUT1JfZWRpdG9yLmh0bWwjZXZlbnQtYmx1clxuXHQgKiBldmVudC5cblx0ICovXG5cdEBPdXRwdXQoKSBibHVyID0gbmV3IEV2ZW50RW1pdHRlcjxDS0VkaXRvcjQuRXZlbnRJbmZvPigpO1xuXG5cdC8qKlxuXHQgKiBUaGUgaW5zdGFuY2Ugb2YgdGhlIGVkaXRvciBjcmVhdGVkIGJ5IHRoaXMgY29tcG9uZW50LlxuXHQgKi9cblx0aW5zdGFuY2U6IGFueTtcblxuXHQvKipcblx0ICogSWYgdGhlIGNvbXBvbmVudCBpcyByZWFk4oCTb25seSBiZWZvcmUgdGhlIGVkaXRvciBpbnN0YW5jZSBpcyBjcmVhdGVkLCBpdCByZW1lbWJlcnMgdGhhdCBzdGF0ZSxcblx0ICogc28gdGhlIGVkaXRvciBjYW4gYmVjb21lIHJlYWTigJNvbmx5IG9uY2UgaXQgaXMgcmVhZHkuXG5cdCAqL1xuXHRwcml2YXRlIF9yZWFkT25seTogYm9vbGVhbiA9IG51bGw7XG5cblx0LyoqXG5cdCAqIEEgY2FsbGJhY2sgZXhlY3V0ZWQgd2hlbiB0aGUgY29udGVudCBvZiB0aGUgZWRpdG9yIGNoYW5nZXMuIFBhcnQgb2YgdGhlXG5cdCAqIGBDb250cm9sVmFsdWVBY2Nlc3NvcmAgKGh0dHBzOi8vYW5ndWxhci5pby9hcGkvZm9ybXMvQ29udHJvbFZhbHVlQWNjZXNzb3IpIGludGVyZmFjZS5cblx0ICpcblx0ICogTm90ZTogVW5zZXQgdW5sZXNzIHRoZSBjb21wb25lbnQgdXNlcyB0aGUgYG5nTW9kZWxgLlxuXHQgKi9cblx0b25DaGFuZ2U/OiAoIGRhdGE6IHN0cmluZyApID0+IHZvaWQ7XG5cblx0LyoqXG5cdCAqIEEgY2FsbGJhY2sgZXhlY3V0ZWQgd2hlbiB0aGUgZWRpdG9yIGhhcyBiZWVuIGJsdXJyZWQuIFBhcnQgb2YgdGhlXG5cdCAqIGBDb250cm9sVmFsdWVBY2Nlc3NvcmAgKGh0dHBzOi8vYW5ndWxhci5pby9hcGkvZm9ybXMvQ29udHJvbFZhbHVlQWNjZXNzb3IpIGludGVyZmFjZS5cblx0ICpcblx0ICogTm90ZTogVW5zZXQgdW5sZXNzIHRoZSBjb21wb25lbnQgdXNlcyB0aGUgYG5nTW9kZWxgLlxuXHQgKi9cblx0b25Ub3VjaGVkPzogKCkgPT4gdm9pZDtcblxuXHRwcml2YXRlIF9kYXRhOiBzdHJpbmcgPSBudWxsO1xuXG5cdC8qKlxuXHQgKiBDS0VkaXRvciA0IHNjcmlwdCB1cmwgYWRkcmVzcy4gU2NyaXB0IHdpbGwgYmUgbG9hZGVkIG9ubHkgaWYgQ0tFRElUT1IgbmFtZXNwYWNlIGlzIG1pc3NpbmcuXG5cdCAqXG5cdCAqIERlZmF1bHRzIHRvICdodHRwczovL2Nkbi5ja2VkaXRvci5jb20vNC4xNC4wL3N0YW5kYXJkLWFsbC9ja2VkaXRvci5qcydcblx0ICovXG5cdEBJbnB1dCgpIGVkaXRvclVybCA9ICdodHRwczovL2Nkbi5ja2VkaXRvci5jb20vNC4xNC4wL3N0YW5kYXJkLWFsbC9ja2VkaXRvci5qcyc7XG5cblx0Y29uc3RydWN0b3IoIHByaXZhdGUgZWxlbWVudFJlZjogRWxlbWVudFJlZiwgcHJpdmF0ZSBuZ1pvbmU6IE5nWm9uZSApIHtcblx0fVxuXG5cdG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcblx0XHRnZXRFZGl0b3JOYW1lc3BhY2UoIHRoaXMuZWRpdG9yVXJsICkudGhlbiggKCkgPT4ge1xuXHRcdFx0dGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoIHRoaXMuY3JlYXRlRWRpdG9yLmJpbmQoIHRoaXMgKSApO1xuXHRcdH0gKS5jYXRjaCggd2luZG93LmNvbnNvbGUuZXJyb3IgKTtcblx0fVxuXG5cdG5nT25EZXN0cm95KCk6IHZvaWQge1xuXHRcdHRoaXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCAoKSA9PiB7XG5cdFx0XHRpZiAoIHRoaXMuaW5zdGFuY2UgKSB7XG5cdFx0XHRcdHRoaXMuaW5zdGFuY2UuZGVzdHJveSgpO1xuXHRcdFx0XHR0aGlzLmluc3RhbmNlID0gbnVsbDtcblx0XHRcdH1cblx0XHR9ICk7XG5cdH1cblxuXHR3cml0ZVZhbHVlKCB2YWx1ZTogc3RyaW5nICk6IHZvaWQge1xuXHRcdHRoaXMuZGF0YSA9IHZhbHVlO1xuXHR9XG5cblx0cmVnaXN0ZXJPbkNoYW5nZSggY2FsbGJhY2s6ICggZGF0YTogc3RyaW5nICkgPT4gdm9pZCApOiB2b2lkIHtcblx0XHR0aGlzLm9uQ2hhbmdlID0gY2FsbGJhY2s7XG5cdH1cblxuXHRyZWdpc3Rlck9uVG91Y2hlZCggY2FsbGJhY2s6ICgpID0+IHZvaWQgKTogdm9pZCB7XG5cdFx0dGhpcy5vblRvdWNoZWQgPSBjYWxsYmFjaztcblx0fVxuXG5cdHByaXZhdGUgY3JlYXRlRWRpdG9yKCk6IHZvaWQge1xuXHRcdGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCB0aGlzLnRhZ05hbWUgKTtcblx0XHR0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5hcHBlbmRDaGlsZCggZWxlbWVudCApO1xuXG5cdFx0aWYgKCB0aGlzLnR5cGUgPT09IENLRWRpdG9yNC5FZGl0b3JUeXBlLkRJVkFSRUEgKSB7XG5cdFx0XHR0aGlzLmNvbmZpZyA9IHRoaXMuZW5zdXJlRGl2YXJlYVBsdWdpbiggdGhpcy5jb25maWcgfHwge30gKTtcblx0XHR9XG5cblx0XHRDS0VESVRPUi5vbignaW5zdGFuY2VDcmVhdGVkJywgZXZ0ID0+IHtcblx0XHRcdHRoaXMubmdab25lLnJ1biggKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmNyZWF0ZWQuZW1pdCggZXZ0ICk7XG5cdFx0XHR9ICk7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBpbnN0YW5jZTogQ0tFZGl0b3I0LkVkaXRvciA9IHRoaXMudHlwZSA9PT0gQ0tFZGl0b3I0LkVkaXRvclR5cGUuSU5MSU5FXG5cdFx0XHQ/IENLRURJVE9SLmlubGluZSggZWxlbWVudCwgdGhpcy5jb25maWcgKVxuXHRcdFx0OiBDS0VESVRPUi5yZXBsYWNlKCBlbGVtZW50LCB0aGlzLmNvbmZpZyApO1xuXG5cdFx0aW5zdGFuY2UuVUkgPSB0aGlzLlVJO1xuXG5cdFx0aW5zdGFuY2Uub25jZSggJ2luc3RhbmNlUmVhZHknLCBldnQgPT4ge1xuXHRcdFx0dGhpcy5pbnN0YW5jZSA9IGluc3RhbmNlO1xuXG5cdFx0XHQvLyBSZWFkIG9ubHkgc3RhdGUgbWF5IGNoYW5nZSBkdXJpbmcgaW5zdGFuY2UgaW5pdGlhbGl6YXRpb24uXG5cdFx0XHR0aGlzLnJlYWRPbmx5ID0gdGhpcy5fcmVhZE9ubHkgIT09IG51bGwgPyB0aGlzLl9yZWFkT25seSA6IHRoaXMuaW5zdGFuY2UucmVhZE9ubHk7XG5cblx0XHRcdHRoaXMuc3Vic2NyaWJlKCB0aGlzLmluc3RhbmNlICk7XG5cblx0XHRcdGNvbnN0IHVuZG8gPSBpbnN0YW5jZS51bmRvTWFuYWdlcjtcblxuXHRcdFx0aWYgKCB0aGlzLmRhdGEgIT09IG51bGwgKSB7XG5cdFx0XHRcdHVuZG8gJiYgdW5kby5sb2NrKCk7XG5cblx0XHRcdFx0aW5zdGFuY2Uuc2V0RGF0YSggdGhpcy5kYXRhLCB7IGNhbGxiYWNrOiAoKSA9PiB7XG5cdFx0XHRcdFx0Ly8gTG9ja2luZyB1bmRvTWFuYWdlciBwcmV2ZW50cyAnY2hhbmdlJyBldmVudC5cblx0XHRcdFx0XHQvLyBUcmlnZ2VyIGl0IG1hbnVhbGx5IHRvIHVwZGF0ZWQgYm91bmQgZGF0YS5cblx0XHRcdFx0XHRpZiAoIHRoaXMuZGF0YSAhPT0gaW5zdGFuY2UuZ2V0RGF0YSgpICkge1xuXHRcdFx0XHRcdFx0dW5kbyA/IGluc3RhbmNlLmZpcmUoICdjaGFuZ2UnICkgOiBpbnN0YW5jZS5maXJlKCAnZGF0YVJlYWR5JyApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR1bmRvICYmIHVuZG8udW5sb2NrKCk7XG5cblx0XHRcdFx0XHR0aGlzLm5nWm9uZS5ydW4oICgpID0+IHtcblx0XHRcdFx0XHRcdHRoaXMucmVhZHkuZW1pdCggZXZ0ICk7XG5cdFx0XHRcdFx0fSApO1xuXHRcdFx0XHR9IH0gKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMubmdab25lLnJ1biggKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMucmVhZHkuZW1pdCggZXZ0ICk7XG5cdFx0XHRcdH0gKTtcblx0XHRcdH1cblx0XHR9ICk7XG5cdH1cblxuXHRwcml2YXRlIHN1YnNjcmliZSggZWRpdG9yOiBhbnkgKTogdm9pZCB7XG5cdFx0ZWRpdG9yLm9uKCAnZm9jdXMnLCBldnQgPT4ge1xuXHRcdFx0dGhpcy5uZ1pvbmUucnVuKCAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuZm9jdXMuZW1pdCggZXZ0ICk7XG5cdFx0XHR9ICk7XG5cdFx0fSApO1xuXG5cdFx0ZWRpdG9yLm9uKCAnYmx1cicsIGV2dCA9PiB7XG5cdFx0XHR0aGlzLm5nWm9uZS5ydW4oICgpID0+IHtcblx0XHRcdFx0aWYgKCB0aGlzLm9uVG91Y2hlZCApIHtcblx0XHRcdFx0XHR0aGlzLm9uVG91Y2hlZCgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGhpcy5ibHVyLmVtaXQoIGV2dCApO1xuXHRcdFx0fSApO1xuXHRcdH0gKTtcblxuXHRcdGVkaXRvci5vbiggJ2RhdGFSZWFkeScsIHRoaXMucHJvcGFnYXRlQ2hhbmdlLCB0aGlzICk7XG5cblx0XHRpZiAoIHRoaXMuaW5zdGFuY2UudW5kb01hbmFnZXIgKSB7XG5cdFx0XHRlZGl0b3Iub24oICdjaGFuZ2UnLCB0aGlzLnByb3BhZ2F0ZUNoYW5nZSwgdGhpcyApO1xuXHRcdH1cblx0XHQvLyBJZiAndW5kbycgcGx1Z2luIGlzIG5vdCBsb2FkZWQsIGxpc3RlbiB0byAnc2VsZWN0aW9uQ2hlY2snIGV2ZW50IGluc3RlYWQuICgjNTQpLlxuXHRcdGVsc2Uge1xuXHRcdFx0ZWRpdG9yLm9uKCAnc2VsZWN0aW9uQ2hlY2snLCB0aGlzLnByb3BhZ2F0ZUNoYW5nZSwgdGhpcyApO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgcHJvcGFnYXRlQ2hhbmdlKCBldmVudDogYW55ICk6IHZvaWQge1xuXHRcdHRoaXMubmdab25lLnJ1biggKCkgPT4ge1xuXHRcdFx0Y29uc3QgbmV3RGF0YSA9IHRoaXMuaW5zdGFuY2UuZ2V0RGF0YSgpO1xuXG5cdFx0XHRpZiAoIGV2ZW50Lm5hbWUgPT0gJ2NoYW5nZScgKSB7XG5cdFx0XHRcdHRoaXMuY2hhbmdlLmVtaXQoIGV2ZW50ICk7XG5cdFx0XHR9IGVsc2UgaWYgKCBldmVudC5uYW1lID09ICdkYXRhUmVhZHknICkge1xuXHRcdFx0XHR0aGlzLmRhdGFSZWFkeS5lbWl0KCBldmVudCApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIG5ld0RhdGEgPT09IHRoaXMuZGF0YSApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLl9kYXRhID0gbmV3RGF0YTtcblx0XHRcdHRoaXMuZGF0YUNoYW5nZS5lbWl0KCBuZXdEYXRhICk7XG5cblx0XHRcdGlmICggdGhpcy5vbkNoYW5nZSApIHtcblx0XHRcdFx0dGhpcy5vbkNoYW5nZSggbmV3RGF0YSApO1xuXHRcdFx0fVxuXHRcdH0gKTtcblx0fVxuXG5cdHByaXZhdGUgZW5zdXJlRGl2YXJlYVBsdWdpbiggY29uZmlnOiBDS0VkaXRvcjQuQ29uZmlnICk6IENLRWRpdG9yNC5Db25maWcge1xuXHRcdGxldCB7IGV4dHJhUGx1Z2lucywgcmVtb3ZlUGx1Z2lucyB9ID0gY29uZmlnO1xuXG5cdFx0ZXh0cmFQbHVnaW5zID0gdGhpcy5yZW1vdmVQbHVnaW4oIGV4dHJhUGx1Z2lucywgJ2RpdmFyZWEnICkgfHwgJyc7XG5cdFx0ZXh0cmFQbHVnaW5zID0gZXh0cmFQbHVnaW5zLmNvbmNhdCggdHlwZW9mIGV4dHJhUGx1Z2lucyA9PT0gJ3N0cmluZycgPyAnLGRpdmFyZWEnIDogJ2RpdmFyZWEnICk7XG5cblx0XHRpZiAoIHJlbW92ZVBsdWdpbnMgJiYgcmVtb3ZlUGx1Z2lucy5pbmNsdWRlcyggJ2RpdmFyZWEnICkgKSB7XG5cblx0XHRcdHJlbW92ZVBsdWdpbnMgPSB0aGlzLnJlbW92ZVBsdWdpbiggcmVtb3ZlUGx1Z2lucywgJ2RpdmFyZWEnICk7XG5cblx0XHRcdGNvbnNvbGUud2FybiggJ1tDS0VESVRPUl0gZGl2YXJlYSBwbHVnaW4gaXMgcmVxdWlyZWQgdG8gaW5pdGlhbGl6ZSBlZGl0b3IgdXNpbmcgQW5ndWxhciBpbnRlZ3JhdGlvbi4nICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIE9iamVjdC5hc3NpZ24oIHt9LCBjb25maWcsIHsgZXh0cmFQbHVnaW5zLCByZW1vdmVQbHVnaW5zIH0gKTtcblx0fVxuXG5cdHByaXZhdGUgcmVtb3ZlUGx1Z2luKCBwbHVnaW5zOiBzdHJpbmcgfCBzdHJpbmdbXSwgdG9SZW1vdmU6IHN0cmluZyApOiBzdHJpbmcgfCBzdHJpbmdbXSB7XG5cdFx0aWYgKCAhcGx1Z2lucyApIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdGNvbnN0IGlzU3RyaW5nID0gdHlwZW9mIHBsdWdpbnMgPT09ICdzdHJpbmcnO1xuXG5cdFx0aWYgKCBpc1N0cmluZyApIHtcblx0XHRcdHBsdWdpbnMgPSAoIHBsdWdpbnMgYXMgc3RyaW5nICkuc3BsaXQoICcsJyApO1xuXHRcdH1cblxuXHRcdHBsdWdpbnMgPSAoIHBsdWdpbnMgYXMgc3RyaW5nW10gKS5maWx0ZXIoIHBsdWdpbiA9PiBwbHVnaW4gIT09IHRvUmVtb3ZlICk7XG5cblx0XHRpZiAoIGlzU3RyaW5nICkge1xuXHRcdFx0cGx1Z2lucyA9ICggcGx1Z2lucyBhcyBzdHJpbmdbXSApLmpvaW4oICcsJyApO1xuXHRcdH1cblxuXHRcdHJldHVybiBwbHVnaW5zO1xuXHR9XG59XG4iXX0=