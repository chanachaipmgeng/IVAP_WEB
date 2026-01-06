/**
 * Rich Text Editor Demo Component
 *
 * Demo component showcasing rich text editor component with formatting options and configurations.
 * Demonstrates text editing, formatting tools, and editor customization.
 *
 * @example
 * ```html
 * <app-rich-text-editor-demo></app-rich-text-editor-demo>
 * ```
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RichTextEditorComponent, RichTextEditorConfig } from '../../../shared/components/rich-text-editor/rich-text-editor.component';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';

@Component({
  selector: 'app-rich-text-editor-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RichTextEditorComponent,
    GlassCardComponent,
    GlassButtonComponent
  ],
  templateUrl: './rich-text-editor-demo.component.html',
  styleUrls: ['./rich-text-editor-demo.component.scss']
})
export class RichTextEditorDemoComponent implements OnInit {
  // Form
  editorForm: FormGroup;

  // Configuration
  config: Partial<RichTextEditorConfig> = {
    theme: 'snow',
    placeholder: 'เริ่มพิมพ์เนื้อหาของคุณ...',
    readOnly: false,
    modules: {
      toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean']
      ],
      keyboard: true,
      history: {
        delay: 2000,
        maxStack: 500,
        userOnly: true
      },
      clipboard: {
        matchVisual: false
      },
      syntax: true,
      imageResize: {
        displaySize: true
      },
      table: true,
      magicUrl: true
    },
    formats: [
      'header', 'font', 'size',
      'bold', 'italic', 'underline', 'strike', 'blockquote',
      'list', 'bullet', 'indent',
      'link', 'image', 'video',
      'color', 'background',
      'align', 'direction',
      'code-block', 'script',
      'table'
    ],
    bounds: 'self',
    debug: false,
    scrollingContainer: 'self',
    strict: true
  };

  // Demo settings
  selectedTheme: 'snow' | 'bubble' = 'snow';
  placeholder: string = 'เริ่มพิมพ์เนื้อหาของคุณ...';
  readOnly: boolean = false;
  disabled: boolean = false;
  loading: boolean = false;

  // Sample content
  sampleContent: string = `
    <h1>ยินดีต้อนรับสู่ Rich Text Editor</h1>
    <p>นี่คือตัวอย่างเนื้อหาที่แสดงความสามารถของ Rich Text Editor</p>

    <h2>ฟีเจอร์หลัก</h2>
    <ul>
      <li><strong>การจัดรูปแบบข้อความ</strong> - ตัวหนา, ตัวเอียง, ขีดเส้นใต้</li>
      <li><strong>การจัดรูปแบบหัวข้อ</strong> - H1 ถึง H6</li>
      <li><strong>การจัดรูปแบบสี</strong> - สีข้อความและสีพื้นหลัง</li>
      <li><strong>การจัดรูปแบบรายการ</strong> - รายการแบบมีหมายเลขและแบบจุด</li>
      <li><strong>การแทรกรูปภาพ</strong> - รองรับการแทรกรูปภาพ</li>
      <li><strong>การแทรกตาราง</strong> - สร้างตารางได้</li>
      <li><strong>การแทรกลิงก์</strong> - เพิ่มลิงก์ได้</li>
    </ul>

    <h2>ตัวอย่างการใช้งาน</h2>
    <blockquote>
      <p>Rich Text Editor นี้ใช้ Quill.js เป็นฐานในการทำงาน และได้รับการปรับแต่งให้เหมาะกับการใช้งานในระบบ</p>
    </blockquote>

    <h3>โค้ดตัวอย่าง</h3>
    <pre><code>function hello() {
  console.log("Hello, World!");
}</code></pre>

    <h3>ตารางตัวอย่าง</h3>
    <table>
      <thead>
        <tr>
          <th>ชื่อ</th>
          <th>อายุ</th>
          <th>อาชีพ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>สมชาย</td>
          <td>25</td>
          <td>โปรแกรมเมอร์</td>
        </tr>
        <tr>
          <td>สมหญิง</td>
          <td>30</td>
          <td>นักออกแบบ</td>
        </tr>
      </tbody>
    </table>
  `;

  constructor(private fb: FormBuilder) {
    this.editorForm = this.fb.group({
      title: ['', Validators.required],
      content: [''],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.updateConfig();
    this.loadSampleContent();
  }

  /**
   * Update configuration
   */
  updateConfig(): void {
    this.config = {
      ...this.config,
      theme: this.selectedTheme,
      placeholder: this.placeholder,
      readOnly: this.readOnly
    };
  }

  /**
   * Load sample content
   */
  loadSampleContent(): void {
    this.editorForm.patchValue({
      title: 'ตัวอย่างบทความ',
      content: this.sampleContent,
      description: 'นี่คือคำอธิบายสั้นๆ ของบทความ'
    });
  }

  /**
   * Clear content
   */
  clearContent(): void {
    this.editorForm.patchValue({
      title: '',
      content: '',
      description: ''
    });
  }

  /**
   * Load different sample content
   */
  loadNewsContent(): void {
    const newsContent = `
      <h1>ข่าวสารล่าสุด</h1>
      <p><strong>วันที่:</strong> 25 ตุลาคม 2025</p>

      <h2>หัวข้อข่าว</h2>
      <p>เนื้อหาข่าวสารที่สำคัญและน่าสนใจ</p>

      <h3>รายละเอียด</h3>
      <ul>
        <li>รายละเอียดที่ 1</li>
        <li>รายละเอียดที่ 2</li>
        <li>รายละเอียดที่ 3</li>
      </ul>

      <blockquote>
        <p>"คำพูดสำคัญจากผู้เกี่ยวข้อง"</p>
      </blockquote>
    `;

    this.editorForm.patchValue({
      title: 'ข่าวสารล่าสุด',
      content: newsContent,
      description: 'ข่าวสารและข้อมูลล่าสุด'
    });
  }

  loadProductContent(): void {
    const productContent = `
      <h1>สินค้าใหม่</h1>
      <p><strong>ราคา:</strong> ฿1,999</p>

      <h2>คุณสมบัติ</h2>
      <ul>
        <li>คุณสมบัติที่ 1</li>
        <li>คุณสมบัติที่ 2</li>
        <li>คุณสมบัติที่ 3</li>
      </ul>

      <h2>รายละเอียดสินค้า</h2>
      <p>รายละเอียดเพิ่มเติมเกี่ยวกับสินค้า</p>

      <h3>วิธีการใช้งาน</h3>
      <ol>
        <li>ขั้นตอนที่ 1</li>
        <li>ขั้นตอนที่ 2</li>
        <li>ขั้นตอนที่ 3</li>
      </ol>
    `;

    this.editorForm.patchValue({
      title: 'สินค้าใหม่',
      content: productContent,
      description: 'สินค้าและบริการใหม่'
    });
  }

  loadDocumentContent(): void {
    const documentContent = `
      <h1>เอกสารทางการ</h1>
      <p><strong>หมายเลขเอกสาร:</strong> DOC-2025-001</p>
      <p><strong>วันที่ออกเอกสาร:</strong> 25 ตุลาคม 2025</p>

      <h2>วัตถุประสงค์</h2>
      <p>วัตถุประสงค์ของเอกสารนี้</p>

      <h2>ขอบเขต</h2>
      <p>ขอบเขตการใช้งาน</p>

      <h2>ข้อกำหนด</h2>
      <table>
        <thead>
          <tr>
            <th>ข้อกำหนด</th>
            <th>รายละเอียด</th>
            <th>สถานะ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ข้อกำหนด 1</td>
            <td>รายละเอียดข้อกำหนด 1</td>
            <td>เสร็จสิ้น</td>
          </tr>
          <tr>
            <td>ข้อกำหนด 2</td>
            <td>รายละเอียดข้อกำหนด 2</td>
            <td>กำลังดำเนินการ</td>
          </tr>
        </tbody>
      </table>
    `;

    this.editorForm.patchValue({
      title: 'เอกสารทางการ',
      content: documentContent,
      description: 'เอกสารและคู่มือการใช้งาน'
    });
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.editorForm.valid) {
      console.log('Form submitted:', this.editorForm.value);
      alert('บันทึกข้อมูลเรียบร้อยแล้ว!');
    } else {
      console.log('Form is invalid');
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    }
  }

  /**
   * Handle content change
   */
  onContentChange(content: string): void {
    console.log('Content changed:', content);
  }

  /**
   * Handle selection change
   */
  onSelectionChange(selection: any): void {
    console.log('Selection changed:', selection);
  }

  /**
   * Handle text change
   */
  onTextChange(change: any): void {
    console.log('Text changed:', change);
  }

  /**
   * Handle editor ready
   */
  onEditorReady(editor: any): void {
    console.log('Editor ready:', editor);
  }

  /**
   * Get theme options
   */
  getThemeOptions(): Array<{value: string, label: string}> {
    return [
      { value: 'snow', label: 'Snow Theme' },
      { value: 'bubble', label: 'Bubble Theme' }
    ];
  }

  /**
   * Get editor statistics
   */
  getEditorStats(): any {
    const content = this.editorForm.get('content')?.value || '';
    const textContent = content.replace(/<[^>]*>/g, '');

    return {
      characterCount: textContent.length,
      wordCount: textContent.split(/\s+/).filter((word: string) => word.length > 0).length,
      paragraphCount: (content.match(/<p>/g) || []).length,
      headingCount: (content.match(/<h[1-6]>/g) || []).length,
      listCount: (content.match(/<[uo]l>/g) || []).length,
      imageCount: (content.match(/<img/g) || []).length,
      linkCount: (content.match(/<a/g) || []).length,
      tableCount: (content.match(/<table/g) || []).length,
      theme: this.selectedTheme,
      readOnly: this.readOnly,
      disabled: this.disabled
    };
  }
}
